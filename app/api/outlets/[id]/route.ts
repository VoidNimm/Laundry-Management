export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const outletId = Number(id);
    if (!Number.isFinite(outletId)) {
      return NextResponse.json(
        { success: false, error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const { nama, alamat, tlp } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama outlet wajib diisi" },
        { status: 400 }
      );
    }

    const outlet = await prisma.tb_outlet.update({
      where: { id: outletId },
      data: {
        nama,
        alamat: alamat || null,
        tlp: tlp || null,
      },
    });

    // Revalidate halaman transaksi agar data outlet yang diupdate muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: outlet,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Outlet tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error("Update outlet error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate outlet" },
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
    const outletId = Number(id);
    if (!Number.isFinite(outletId)) {
      return NextResponse.json(
        { success: false, error: "ID tidak valid" },
        { status: 400 }
      );
    }

    await prisma.tb_outlet.delete({
      where: { id: outletId },
    });

    // Revalidate halaman transaksi agar outlet yang dihapus tidak muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Outlet berhasil dihapus",
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Outlet tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error("Delete outlet error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus outlet" },
      { status: 500 }
    );
  }
}
