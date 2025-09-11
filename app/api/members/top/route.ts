import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get top members with their transaction statistics
    const topMembers = await prisma.tb_member.findMany({
      include: {
        tb_transaksi: {
          select: {
            id: true,
            created_at: true,
            biaya_tambahan: true,
            diskon: true,
            pajak: true,
            tb_detail_transaksi: {
              select: {
                qty: true,
                tb_paket: {
                  select: {
                    harga: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate statistics for each member
    const membersWithStats = topMembers.map((member: any) => {
      const transactions = member.tb_transaksi || [];
      const totalTransactions = transactions.length;
      
      // Calculate total spending from all transactions
      const totalSpending = transactions.reduce((sum: number, t: any) => {
        // Calculate subtotal from detail transactions
        const subtotal = t.tb_detail_transaksi.reduce((detailSum: number, detail: any) => {
          return detailSum + ((detail.qty || 1) * (detail.tb_paket?.harga || 0));
        }, 0);
        
        // Add additional costs and apply discount/tax
        const biayaTambahan = t.biaya_tambahan || 0;
        const diskon = t.diskon || 0;
        const pajak = t.pajak || 0;
        
        const totalTransaction = subtotal + biayaTambahan - (subtotal * diskon / 100) + pajak;
        return sum + totalTransaction;
      }, 0);
      
      // Get the most recent transaction date
      const lastVisit = transactions.length > 0 
        ? transactions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : member.created_at;

      return {
        id: member.id,
        nama: member.nama,
        total_transaksi: totalTransactions,
        total_belanja: totalSpending,
        last_visit: lastVisit,
      };
    });

    // Sort by total spending (descending) and limit to top 10
    const sortedMembers = membersWithStats
      .filter(member => member.total_transaksi > 0) // Only members with transactions
      .sort((a, b) => b.total_belanja - a.total_belanja)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      members: sortedMembers,
    });
  } catch (error: any) {
    console.error("Get top members error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Gagal memuat data top member",
      members: []
    }, { status: 500 });
  }
}
