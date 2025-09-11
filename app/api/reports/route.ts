import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    let startDate = new Date();
    
    // Handle different period types
    if (period === 7) {
      // This week - start from Monday
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(today.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 30) {
      // 1 month ago
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 90) {
      // 3 months ago
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      // Default: X days ago
      startDate.setDate(startDate.getDate() - period);
    }

    // Get transactions for the period with details
    const transactions = await prisma.tb_transaksi.findMany({
      where: {
        tgl: {
          gte: startDate,
        },
      },
      include: {
        tb_member: {
          select: {
            nama: true,
          },
        },
        tb_detail_transaksi: {
          include: {
            tb_paket: {
              select: {
                nama_paket: true,
                harga: true,
              },
            },
          },
        },
      },
      orderBy: {
        tgl: 'desc',
      },
    });

    // Calculate statistics using proper PHP logic
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => {
      // Calculate subtotal from transaction details
      const subtotal = t.tb_detail_transaksi.reduce((itemSum, detail) => {
        return itemSum + ((detail.qty || 0) * (detail.tb_paket?.harga || 0));
      }, 0);
      
      const biayaTambahan = t.biaya_tambahan || 0;
      const diskonPercent = t.diskon || 0;
      const pajakPercent = t.pajak || 11;
      
      // Apply PHP calculation logic
      const baseAmount = subtotal + biayaTambahan;
      const diskonValue = baseAmount * (diskonPercent / 100);
      const afterDiscount = Math.max(0, baseAmount - diskonValue);
      const pajakValue = afterDiscount * (pajakPercent / 100);
      const total = afterDiscount + pajakValue;
      
      return sum + total;
    }, 0);

    const totalMembers = await prisma.tb_member.count();
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Generate chart data
    const chartData = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.tgl.toISOString().split('T')[0] === dateStr
      ).length;
      
      chartData.push({
        date: dateStr,
        transactions: dayTransactions,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        totalRevenue,
        totalMembers,
        avgTransactionValue,
        transactions: transactions.slice(0, 50), // Limit to 50 for display
        chartData,
      },
    });
  } catch (error: any) {
    console.error("Get reports error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data laporan" }, { status: 500 });
  }
}
