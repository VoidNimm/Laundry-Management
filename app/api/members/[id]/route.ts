// app/api/members/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
// import { Prisma } from '@prisma/client'; // Jika mau pakai tipe enum Prisma

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // params adalah Promise, perlu di-await
) {
  try {
    const { id } = await context.params; // penting: await
    const memberId = Number(id);
    if (!Number.isFinite(memberId)) {
      return NextResponse.json(
        { success: false, error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama, alamat, jenis_kelamin, tlp } = body as {
      nama?: string;
      alamat?: string | null;
      jenis_kelamin?: string | null; // atau Prisma.$Enums.jenis_kelamin_enum | null
      tlp?: string | null;
    };

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    const member = await prisma.tb_member.update({
      where: { id: memberId },
      data: {
        nama,
        alamat: alamat ?? null,
        jenis_kelamin: (jenis_kelamin ?? null) as any, // sesuaikan ke enum Prisma jika perlu
        tlp: tlp ?? null,
      },
    });

    // Revalidate halaman transaksi agar data member yang diupdate muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    if (error?.code === "P2025") {
      // Prisma: record to update not found
      return NextResponse.json(
        { success: false, error: "Member tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error("Update member error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // penting: await
    const memberId = Number(id);
    if (!Number.isFinite(memberId)) {
      return NextResponse.json(
        { success: false, error: "ID tidak valid" },
        { status: 400 }
      );
    }

    await prisma.tb_member.delete({ where: { id: memberId } });

    // Revalidate halaman transaksi agar member yang dihapus tidak muncul di form
    revalidatePath("/transaksi");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Member berhasil dihapus",
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Member tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error("Delete member error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus member" },
      { status: 500 }
    );
  }
}
