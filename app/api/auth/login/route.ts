import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// app/api/auth/login/route.ts
export const runtime = 'nodejs'; // Memastikan route ini berjalan di Node.js, bukan Edge

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Validasi apakah role yang diinput valid
    if (!Object.values(Prisma.role_enum).includes(role)) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
    }

    // Cari user berdasarkan username dan role yang sudah divalidasi
    const user = await prisma.tb_user.findFirst({
      where: {
        username: username,
        role: role, // Langsung gunakan role karena sudah divalidasi dan tipenya sesuai
      },
      include: {
        tb_outlet: true, // Include relasi untuk mendapatkan data outlet
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Kombinasi username dan role tidak ditemukan" }, { status: 401 });
    }

    // Gunakan bcrypt.compare untuk memvalidasi password dengan aman
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Password salah" }, { status: 401 });
    }

    // Hapus password dari objek user sebelum mengirim respons
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        outlet: user.tb_outlet, // Menyusun ulang data outlet agar lebih mudah diakses di frontend
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
