import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nama_paket, jenis, harga, id_outlet } = await request.json();

    if (!nama_paket || !jenis || !harga || !id_outlet) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const updatedPackage = await prisma.tb_paket.update({
      where: { id },
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

    return NextResponse.json({
      success: true,
      data: updatedPackage,
    });
  } catch (error: any) {
    console.error("Update package error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate paket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.tb_paket.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Paket berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus paket" },
      { status: 500 }
    );
  }
}
