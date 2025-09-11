import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.tb_user.findMany({
      include: {
        tb_outlet: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Remove passwords from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return NextResponse.json({
      success: true,
      data: usersWithoutPassword,
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data pengguna" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nama, username, password, role, id_outlet } = await request.json();

    if (!nama || !username || !password || !role) {
      return NextResponse.json({ success: false, error: "Nama, username, password, dan role wajib diisi" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.tb_user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.tb_user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        id_outlet: id_outlet || null,
      },
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
    console.error("Create user error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan pengguna" }, { status: 500 });
  }
}
