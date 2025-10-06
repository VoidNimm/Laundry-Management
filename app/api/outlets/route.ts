export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const outlets = await prisma.tb_outlet.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: outlets,
    });
  } catch (error: any) {
    console.error("Get outlets error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data outlet" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, alamat, tlp } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama outlet wajib diisi" },
        { status: 400 }
      );
    }

    const outlet = await prisma.tb_outlet.create({
      data: {
        nama,
        alamat: alamat || null,
        tlp: tlp || null,
      },
    });

    // Revalidate halaman transaksi agar outlet baru muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: outlet,
    });
  } catch (error: any) {
    console.error("Create outlet error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan outlet" },
      { status: 500 }
    );
  }
}
