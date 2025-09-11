import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    
    if (!outletId) {
      return NextResponse.json({ success: false, error: "Outlet ID is required" }, { status: 400 });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get recap for today
    const recap = await prisma.businessRecap.findFirst({
      where: {
        outletId: parseInt(outletId),
        date: today
      }
    });

    return NextResponse.json({ success: true, recap });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}