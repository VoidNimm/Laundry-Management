import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { nama, alamat, jenis_kelamin, tlp } = await request.json();

    if (!nama) {
      return NextResponse.json({ success: false, error: "Nama wajib diisi" }, { status: 400 });
    }

    const member = await prisma.tb_member.update({
      where: { id },
      data: {
        nama,
        alamat: alamat || null,
        jenis_kelamin: jenis_kelamin || null,
        tlp: tlp || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error("Update member error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate member" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    await prisma.tb_member.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Member berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus member" }, { status: 500 });
  }
}
