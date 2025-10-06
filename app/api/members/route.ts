import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.tb_member.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data member" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nama, alamat, jenis_kelamin, tlp } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    const member = await prisma.tb_member.create({
      data: {
        nama,
        alamat: alamat || null,
        jenis_kelamin: jenis_kelamin || null,
        tlp: tlp || null,
      },
    });

    // Revalidate halaman transaksi agar member baru muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error("Create member error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan member" },
      { status: 500 }
    );
  }
}
