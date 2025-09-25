export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const packageId = Number(id);
    if (!Number.isFinite(packageId)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const { nama_paket, jenis, harga, id_outlet } = await request.json();

    if (!nama_paket || !jenis || !harga || !id_outlet) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const updatedPackage = await prisma.tb_paket.update({
      where: { id: packageId },
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
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: "Paket tidak ditemukan" }, { status: 404 });
    }
    console.error("Update package error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate paket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const packageId = Number(id);
    if (!Number.isFinite(packageId)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.tb_paket.delete({
      where: { id: packageId },
    });

    return NextResponse.json({
      success: true,
      message: "Paket berhasil dihapus",
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: "Paket tidak ditemukan" }, { status: 404 });
    }
    console.error("Delete package error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus paket" },
      { status: 500 }
    );
  }
}
