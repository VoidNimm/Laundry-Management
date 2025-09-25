export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper untuk menghitung total dari sebuah transaksi
// Ini mengasumsikan struktur data transaksi Anda
function calculateTransactionTotal(transaksi: any): number {
  if (!transaksi) return 0;

  const subtotal = transaksi.tb_detail_transaksi.reduce((acc: number, detail: any) => {
    return acc + (detail.qty * (detail.tb_paket?.harga || 0));
  }, 0);

  const totalAfterBiayaTambahan = subtotal + (transaksi.biaya_tambahan || 0);
  const totalAfterDiskon = totalAfterBiayaTambahan * (1 - (transaksi.diskon || 0) / 100);
  const totalFinal = totalAfterDiskon + (transaksi.pajak || 0);
  
  return totalFinal;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletIdStr = searchParams.get('outletId');
    
    if (!outletIdStr) {
      return NextResponse.json({ success: false, error: "Outlet ID wajib diisi" }, { status: 400 });
    }
    const outletId = Number(outletIdStr);
    if (!Number.isFinite(outletId)) {
        return NextResponse.json({ success: false, error: "Outlet ID tidak valid" }, { status: 400 });
    }

    // --- Kalkulasi Pendapatan Harian ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const dailyTransactions = await prisma.tb_transaksi.findMany({
        where: {
            id_outlet: outletId,
            dibayar: 'dibayar',
            tgl_bayar: {
                gte: todayStart,
                lt: todayEnd,
            },
        },
        include: {
            tb_detail_transaksi: {
                include: {
                    tb_paket: true,
                }
            }
        }
    });
    const dailyRevenue = dailyTransactions.reduce((sum, tx) => sum + calculateTransactionTotal(tx), 0);

    // --- Kalkulasi Pendapatan Bulanan ---
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1);

    const monthlyTransactions = await prisma.tb_transaksi.findMany({
        where: {
            id_outlet: outletId,
            dibayar: 'dibayar',
            tgl_bayar: {
                gte: monthStart,
                lt: monthEnd,
            },
        },
        include: {
            tb_detail_transaksi: {
                include: {
                    tb_paket: true,
                }
            }
        }
    });
    const monthlyRevenue = monthlyTransactions.reduce((sum, tx) => sum + calculateTransactionTotal(tx), 0);

    const recap = {
        date: todayStart,
        dailyRevenue: dailyRevenue,
        monthlyRevenue: monthlyRevenue,
    };

    return NextResponse.json({ success: true, recap });
  } catch (error: any) {
    console.error("Recap API Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data rekapitulasi" }, { status: 500 });
  }
}