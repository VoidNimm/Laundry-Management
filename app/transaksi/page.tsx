import { cn } from "@/lib/utils";
import {
  IconHistory,
  IconCirclePlus,
  IconCalendar,
  IconTrendingUp,
  IconUsers,
  IconCreditCard,
  IconPackage,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";
import MyForm from "@/components/form";
import prisma from "@/lib/prisma";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

// Disable caching untuk halaman ini agar data selalu fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getRecentTransactions() {
  const transactions = await prisma.tb_transaksi.findMany({
    select: {
      id: true,
      kode_invoice: true,
      status: true,
      tgl: true,
      tb_member: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 10,
  });

  return transactions;
}

async function getTransactionStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayCount, monthCount, totalMembers, pendingTransactions] =
    await Promise.all([
      prisma.tb_transaksi.count({
        where: {
          tgl: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.tb_transaksi.count({
        where: {
          tgl: {
            gte: thisMonth,
          },
        },
      }),
      prisma.tb_member.count(),
      prisma.tb_transaksi.count({
        where: {
          status: {
            in: ["baru", "proses"],
          },
        },
      }),
    ]);

  return {
    todayCount,
    monthCount,
    totalMembers,
    pendingTransactions,
  };
}

async function getChartData() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const transactions = await prisma.tb_transaksi.findMany({
    where: {
      tgl: {
        gte: oneMonthAgo,
      },
    },
    select: {
      tgl: true,
    },
  });

  // Group by date
  const dateMap = new Map<string, number>();

  // Initialize all dates in the last month with 0
  const today = new Date();
  const daysInPeriod = Math.ceil(
    (today.getTime() - oneMonthAgo.getTime()) / (1000 * 60 * 60 * 24)
  );

  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(oneMonthAgo);
    date.setDate(oneMonthAgo.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    dateMap.set(dateStr, 0);
  }

  // Count transactions per date
  transactions.forEach((t) => {
    const dateStr = t.tgl.toISOString().split("T")[0];
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });

  // Convert to array and sort
  return Array.from(dateMap.entries())
    .map(([date, transactions]) => ({ date, transactions }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function getFormData() {
  const [outlets, members, packages] = await Promise.all([
    prisma.tb_outlet.findMany({
      select: {
        id: true,
        nama: true,
      },
    }),
    prisma.tb_member.findMany({
      select: {
        id: true,
        nama: true,
      },
    }),
    prisma.tb_paket.findMany({
      select: {
        id: true,
        nama_paket: true,
        jenis: true,
        harga: true,
      },
    }),
  ]);

  return { outlets, members, packages };
}

export default async function TransaksiPage() {
  const [recentTransactions, stats, chartData, formData] = await Promise.all([
    getRecentTransactions(),
    getTransactionStats(),
    getChartData(),
    getFormData(),
  ]);

  return (
    <SidebarWrapper
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-semibold">Transaksi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Kelola transaksi dan pantau performa laundry Anda
                    </p>
                  </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                  {/* Stats Cards - 2x2 Vertical Layout */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <IconTrendingUp className="h-6 w-6 text-blue-200" />
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {stats.todayCount}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-blue-100 text-sm font-medium">
                              Hari Ini
                            </p>
                            <p className="text-blue-100 text-xs">Transaksi</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <IconCalendar className="h-6 w-6 text-emerald-200" />
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {stats.monthCount}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-emerald-100 text-sm font-medium">
                              Bulan Ini
                            </p>
                            <p className="text-emerald-100 text-xs">
                              Transaksi
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <IconUsers className="h-6 w-6 text-purple-200" />
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {stats.totalMembers}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-purple-100 text-sm font-medium">
                              Total Member
                            </p>
                            <p className="text-purple-100 text-xs">Terdaftar</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <IconPackage className="h-6 w-6 text-orange-200" />
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {stats.pendingTransactions}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-orange-100 text-sm font-medium">
                              Pending
                            </p>
                            <p className="text-orange-100 text-xs">Transaksi</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Chart - Spans 2 columns */}
                  <div className="lg:col-span-4">
                    <ChartAreaInteractive chartData={chartData} />
                  </div>

                  {/* Transaction Form - Large section */}
                  <Card className="lg:col-span-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <IconCirclePlus className="mr-2" />
                          Buat Transaksi Baru
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <IconCalendar className="inline mr-1" />
                          {format(new Date(), "dd/MM/yyyy HH:mm")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <MyForm
                        outlets={formData.outlets}
                        members={formData.members}
                        packages={formData.packages}
                      />
                    </CardContent>
                  </Card>

                  {/* Recent Transactions - Spans 2 columns */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <IconHistory className="mr-2" />
                        Transaksi Terbaru
                      </CardTitle>
                      <CardDescription>
                        {recentTransactions.length} transaksi terbaru
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[800px] overflow-auto">
                        {recentTransactions.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-muted-foreground">
                                  #{t.id}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {t.kode_invoice}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">
                                {t.tb_member?.nama || "Guest"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(t.tgl), "dd/MM/yyyy HH:mm")}
                              </p>
                            </div>
                            <Badge
                              variant={
                                t.status === "selesai"
                                  ? "default"
                                  : t.status === "proses"
                                  ? "secondary"
                                  : t.status === "diambil"
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {t.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  );
}
