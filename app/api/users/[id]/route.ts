import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { nama, username, password, role, id_outlet } = await request.json();

    if (!nama || !username || !role) {
      return NextResponse.json({ success: false, error: "Nama, username, dan role wajib diisi" }, { status: 400 });
    }

    // Check if username already exists (excluding current user)
    const existingUser = await prisma.tb_user.findFirst({
      where: { 
        username,
        NOT: { id }
      },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
    }

    const updateData: any = {
      nama,
      username,
      role,
      id_outlet: id_outlet || null,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.tb_user.update({
      where: { id },
      data: updateData,
      include: {
        tb_outlet: {
          select: {
            nama: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate pengguna" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    await prisma.tb_user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
