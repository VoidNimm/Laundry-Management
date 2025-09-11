import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Find user by username and role
    const user = await prisma.tb_user.findFirst({
      where: {
        username: username,
        role: role as any,
      },
      include: {
        tb_outlet: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Username atau role tidak ditemukan" }, { status: 401 });
    }

    // For demo purposes, we'll use simple password comparison
    // In production, you should use bcrypt.compare(password, user.password)
    const isValidPassword = password === user.password || await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Password salah" }, { status: 401 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        outlet: user.tb_outlet,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
