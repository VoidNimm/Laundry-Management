import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nama, alamat, tlp } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama outlet wajib diisi" },
        { status: 400 }
      );
    }

    const outlet = await prisma.tb_outlet.update({
      where: { id },
      data: {
        nama,
        alamat: alamat || null,
        tlp: tlp || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: outlet,
    });
  } catch (error: any) {
    console.error("Update outlet error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate outlet" },
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

    await prisma.tb_outlet.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Outlet berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete outlet error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus outlet" },
      { status: 500 }
    );
  }
}
