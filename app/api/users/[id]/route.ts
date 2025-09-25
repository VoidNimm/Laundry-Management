export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const { nama, username, password, role, id_outlet } = await request.json();

    if (!nama || !username || !role) {
      return NextResponse.json(
        { success: false, error: "Nama, username, dan role wajib diisi" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.tb_user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    const updateData: any = {
      nama,
      username,
      role,
      id_outlet: id_outlet || null,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.tb_user.update({
      where: { id: userId },
      data: updateData,
      include: {
        tb_outlet: {
          select: {
            nama: true,
          },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan" }, { status: 404 });
    }
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate pengguna" },
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
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.tb_user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan" }, { status: 404 });
    }
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
