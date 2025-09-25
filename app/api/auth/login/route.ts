export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Sumber kebenaran role yang diizinkan
const ALLOWED_ROLES = ['admin', 'kasir', 'owner'] as const;
type Role = typeof ALLOWED_ROLES[number];

function isRole(v: unknown): v is Role {
  return typeof v === 'string' && (ALLOWED_ROLES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }
    if (!isRole(role)) {
      return NextResponse.json({ success: false, error: 'Role tidak valid' }, { status: 400 });
    }

    const user = await prisma.tb_user.findFirst({
      where: {
        username,
        role: role as any,
      },
      include: { tb_outlet: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Kombinasi username dan role tidak ditemukan' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 });
    }

    const { password: _pw, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        outlet: (user as any).tb_outlet ?? null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}