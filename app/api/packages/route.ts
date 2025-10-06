import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.tb_paket.findMany({
      include: {
        tb_outlet: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error: any) {
    console.error("Get packages error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data paket" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nama_paket, jenis, harga, id_outlet } = await request.json();

    if (!nama_paket || !jenis || !harga || !id_outlet) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const newPackage = await prisma.tb_paket.create({
      data: {
        nama_paket,
        jenis,
        harga: parseInt(harga),
        id_outlet: parseInt(id_outlet),
      },
      include: {
        tb_outlet: {
          select: {
            nama: true,
          },
        },
      },
    });

    // Revalidate halaman transaksi agar paket baru muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: newPackage,
    });
  } catch (error: any) {
    console.error("Create package error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan paket" },
      { status: 500 }
    );
  }
}
