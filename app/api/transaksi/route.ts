export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_outlet, id_member, batas_waktu, biaya_tambahan, diskon, diskon_type, pajak, status, dibayar, items } = body;

    // Basic validation
    if (!id_outlet) {
      return NextResponse.json({ success: false, error: "Outlet wajib dipilih." }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Tambahkan minimal 1 paket." }, { status: 400 });
    }

    // Generate a unique invoice code
    const kode_invoice = `INV-${Date.now()}`;

    // Calculate subtotal for items
    let subtotal = 0;
    for (const item of items) {
      const paket = await prisma.tb_paket.findUnique({
        where: { id: parseInt(item.paket_id) },
      });
      if (!paket) {
        return NextResponse.json({ success: false, error: "Paket tidak valid." }, { status: 400 });
      }
      subtotal += (item.qty || 0) * paket.harga;
    }

    // Normalize numbers
    const parsedBiayaTambahan = parseFloat(biaya_tambahan || 0);
    let parsedDiskon = parseFloat(diskon || 0);
    const parsedPajak = parseFloat(pajak || 0);

    // Convert fixed discount to percent for storage (as in PHP example)
    if (diskon_type === 'fixed') {
      const base = (subtotal + parsedBiayaTambahan);
      parsedDiskon = base > 0 ? Math.min(100.0, (parsedDiskon / base) * 100.0) : 0.0;
    }

    const tgl_bayar_final = dibayar === 'dibayar' ? new Date() : null;

    const newTransaction = await prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      const transaction = await prisma.tb_transaksi.create({
        data: {
          id_outlet: parseInt(id_outlet),
          kode_invoice,
          id_member: id_member ? parseInt(id_member) : null,
          tgl: new Date(), // Current date/time
          batas_waktu: batas_waktu ? new Date(batas_waktu) : null,
          tgl_bayar: tgl_bayar_final,
          biaya_tambahan: parsedBiayaTambahan,
          diskon: parsedDiskon,
          pajak: parsedPajak,
          status: status || 'baru',
          dibayar: dibayar || 'belum_dibayar',
          id_user: 1, // Hardcoded for now, replace with actual user ID
        },
      });

      for (const item of items) {
        await prisma.tb_detail_transaksi.create({
          data: {
            id_transaksi: transaction.id,
            id_paket: parseInt(item.paket_id),
            qty: parseFloat(item.qty || 0),
            keterangan: item.keterangan || '',
          },
        });
      }
      return transaction;
    });

    // Update business recap metrics
    await updateBusinessRecap(parseInt(id_outlet));

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function updateBusinessRecap(outletId: number) {
  try {
    // Calculate daily revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyRevenue = await prisma.tb_transaksi.aggregate({
      where: {
        id_outlet: outletId,
        tgl: {
          gte: today,
          lt: tomorrow
        },
        dibayar: 'dibayar'
      },
      _sum: {
        biaya_tambahan: true
      }
    });

    // Calculate monthly revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyRevenue = await prisma.tb_transaksi.aggregate({
      where: {
        id_outlet: outletId,
        tgl: {
          gte: startOfMonth,
          lt: endOfMonth
        },
        dibayar: 'dibayar'
      },
      _sum: {
        biaya_tambahan: true
      }
    });
  } catch (error) {
    console.error('Error updating business recap:', error);
  }
}