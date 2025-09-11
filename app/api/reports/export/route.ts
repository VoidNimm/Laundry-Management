import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    const format = searchParams.get('format') || 'excel';

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

    // Prepare data for export
    const exportData = transactions.map(transaction => {
      // Calculate total using same logic as PHP
      const subtotal = transaction.tb_detail_transaksi.reduce((sum, detail) => {
        return sum + ((detail.qty || 0) * (detail.tb_paket?.harga || 0));
      }, 0);
      
      const biayaTambahan = transaction.biaya_tambahan || 0;
      const diskonPercent = transaction.diskon || 0;
      const pajakPercent = transaction.pajak || 11;
      
      const baseAmount = subtotal + biayaTambahan;
      const diskonValue = baseAmount * (diskonPercent / 100);
      const afterDiscount = Math.max(0, baseAmount - diskonValue);
      const pajakValue = afterDiscount * (pajakPercent / 100);
      const total = afterDiscount + pajakValue;

      // Format package details
      const packageDetails = transaction.tb_detail_transaksi.map(detail => 
        `${detail.tb_paket?.nama_paket || 'Paket'} x${detail.qty}`
      ).join(', ');

      return {
        'Invoice': transaction.kode_invoice,
        'Member': transaction.tb_member?.nama || 'Guest',
        'Tanggal': new Date(transaction.tgl).toLocaleDateString('id-ID'),
        'Detail Paket': packageDetails,
        'Subtotal': subtotal,
        'Biaya Tambahan': biayaTambahan,
        'Diskon (%)': diskonPercent,
        'Pajak (%)': pajakPercent,
        'Total': total,
        'Status': transaction.status,
        'Dibayar': transaction.dibayar || 'belum_bayar',
        'Tanggal Bayar': transaction.tgl_bayar ? new Date(transaction.tgl_bayar).toLocaleDateString('id-ID') : '-'
      };
    });

    if (format === 'excel') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Transaksi');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for Excel download
      const headers = new Headers();
      headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      headers.set('Content-Disposition', `attachment; filename="laporan-transaksi-${period}-hari.xlsx"`);

      return new NextResponse(buffer, { headers });
    }

    // If format is not excel, return error for now (PDF can be implemented later)
    return NextResponse.json({ 
      success: false, 
      error: "Format tidak didukung. Gunakan format=excel" 
    }, { status: 400 });

  } catch (error: any) {
    console.error("Export reports error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Gagal mengekspor laporan" 
    }, { status: 500 });
  }
}
