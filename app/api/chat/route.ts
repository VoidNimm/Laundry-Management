import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get context data from database
    const [
      totalTransactions,
      totalMembers,
      totalOutlets,
      totalPackages,
      recentTransactions,
      topMembers,
      outlets,
    ] = await Promise.all([
      prisma.tb_transaksi.count(),
      prisma.tb_member.count(),
      prisma.tb_outlet.count(),
      prisma.tb_paket.count(),
      prisma.tb_transaksi.findMany({
        take: 5,
        orderBy: { tgl: "desc" },
        include: {
          tb_member: { select: { nama: true } },
          tb_outlet: { select: { nama: true } },
          tb_detail_transaksi: {
            include: {
              tb_paket: { select: { nama_paket: true, harga: true } },
            },
          },
        },
      }),
      prisma.tb_member.findMany({
        take: 5,
        include: {
          tb_transaksi: {
            select: { id: true },
          },
        },
      }),
      prisma.tb_outlet.findMany({
        include: {
          tb_transaksi: {
            select: { id: true },
          },
        },
      }),
    ]);

    // Calculate revenue
    const transactions = await prisma.tb_transaksi.findMany({
      include: {
        tb_detail_transaksi: {
          include: {
            tb_paket: { select: { harga: true } },
          },
        },
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => {
      const subtotal = t.tb_detail_transaksi.reduce((itemSum, detail) => {
        return itemSum + (detail.qty || 0) * (detail.tb_paket?.harga || 0);
      }, 0);
      const biayaTambahan = t.biaya_tambahan || 0;
      const diskonPercent = t.diskon || 0;
      const pajakPercent = t.pajak || 11;
      const baseAmount = subtotal + biayaTambahan;
      const diskonValue = baseAmount * (diskonPercent / 100);
      const afterDiscount = Math.max(0, baseAmount - diskonValue);
      const pajakValue = afterDiscount * (pajakPercent / 100);
      return sum + afterDiscount + pajakValue;
    }, 0);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await prisma.tb_transaksi.count({
      where: {
        tgl: { gte: today, lt: tomorrow },
      },
    });

    // Get this month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTransactions = await prisma.tb_transaksi.count({
      where: {
        tgl: { gte: startOfMonth },
      },
    });

    // Prepare context for AI dengan prompt engineering yang lebih baik
    const context = `
# IDENTITAS & PERAN
Anda adalah AI Business Assistant "SmartLaundry" — sistem manajemen laundry profesional.
Tujuan: membantu owner/manager mengambil keputusan bisnis berbasis data secara cepat dan tepat.

# DATA REAL-TIME SISTEM
## Statistik Umum:
- Total Transaksi: ${totalTransactions}
- Total Revenue: Rp ${totalRevenue.toLocaleString("id-ID")}
- Total Member: ${totalMembers}
- Total Outlet: ${totalOutlets}
- Total Paket Layanan: ${totalPackages}
- Transaksi Hari Ini: ${todayTransactions}
- Transaksi Bulan Ini: ${monthTransactions}

## Performa Outlet:
${outlets
  .map((o, i) => `${i + 1}. ${o.nama}: ${o.tb_transaksi.length} transaksi`)
  .join("\n")}

## Transaksi Terbaru:
${recentTransactions
  .map(
    (t, i) =>
      `${i + 1}. #${t.kode_invoice} - ${t.tb_member?.nama || "Guest"} | ${
        t.tb_outlet.nama
      } | Status: ${t.status}`
  )
  .join("\n")}

## Top 5 Member Loyal:
${topMembers
  .sort((a, b) => b.tb_transaksi.length - a.tb_transaksi.length)
  .slice(0, 5)
  .map((m, i) => `${i + 1}. ${m.nama} - ${m.tb_transaksi.length} transaksi`)
  .join("\n")}

# ATURAN KOMUNIKASI
1. Langsung ke inti; 1–3 kalimat. Tambahkan kesimpulan singkat 1 kalimat jika relevan.
2. Fokus pada konteks laundry dan data sistem di atas.
3. Jawaban harus berbasis data real-time di konteks; tanpa asumsi/angka baru.
4. Gunakan bahasa Indonesia profesional dan ramah.
5. Format Rupiah: Rp dan pemisah ribuan (contoh: Rp 1.250.000).
6. Berikan rekomendasi praktis yang spesifik dan dapat ditindaklanjuti bila diminta atau relevan.
7. Maksimum 1–2 emoji bila perlu.

# CONTOH JAWABAN YANG BAIK
User: "Berapa total transaksi?"
✅ "Total transaksi: ${totalTransactions}. Bulan ini: ${monthTransactions} transaksi. Kesimpulan: Bulan ini menyumbang ${monthTransactions}/${totalTransactions} dari total."

User: "Outlet mana yang paling ramai?"
✅ "Outlet ${outlets[0]?.nama} tertinggi dengan ${
      outlets[0]?.tb_transaksi.length
    } transaksi${
      outlets[1]
        ? `, disusul ${outlets[1].nama} (${outlets[1].tb_transaksi.length}).`
        : "."
    } Kesimpulan: Jadikan ${outlets[0]?.nama} acuan operasional."

User: "Bagaimana cara meningkatkan penjualan?"
✅ "Data menunjukkan ${
      outlets[0]?.nama
    } performa terbaik. Replikasi taktiknya di outlet lain, aktifkan Top 5 member loyal, dan jalankan promo di hari dengan transaksi terendah. Kesimpulan: Prioritaskan replikasi strategi outlet top dan retensi member loyal."

# CONTOH JAWABAN YANG BURUK (HINDARI)
❌ Pembukaan panjang tanpa data.
❌ Klaim/analisis tanpa mengutip data sistem.
❌ Angka/tebakan yang tidak ada di konteks.

# BATASAN
- Hanya jawab hal terkait bisnis laundry dan data di atas.
- Jangan membuat data/angka baru atau asumsi di luar konteks.
- Jangan bertele-tele; batasi maksimal 3–4 kalimat.

# RESPONS KHUSUS
- Data tidak tersedia: "Data [X] belum tersedia di sistem."
- Pertanyaan tidak relevan: "Saya fokus membantu analisis bisnis laundry. Ada yang bisa saya bantu terkait data laundry?"
- Butuh klarifikasi: "Maksud Anda [X] atau [Y]?"
- Jika data kurang untuk rekomendasi, minta data tambahan spesifik.

`;

    // Call Gemini API
    // Update: gunakan gemini-pro karena gemini-1.5-flash tidak tersedia di v1beta
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: context }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Saya siap membantu Anda dengan informasi tentang sistem SmartLaundry. Silakan ajukan pertanyaan!",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: text,
      stats: {
        totalTransactions,
        totalRevenue,
        totalMembers,
        todayTransactions,
        monthTransactions,
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat memproses permintaan",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
