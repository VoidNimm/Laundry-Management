"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconDownload, IconCalendar, IconTrendingUp, IconUsers, IconCurrencyDollar } from "@tabler/icons-react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

interface ReportData {
  totalTransactions: number;
  totalRevenue: number;
  totalMembers: number;
  avgTransactionValue: number;
  transactions: any[];
  chartData: any[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?period=${period}`);
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string = 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?period=${period}&format=${format}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-transaksi-${period}-hari.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Laporan berhasil diunduh");
    } catch (error) {
      toast.error("Gagal mengunduh laporan");
    }
  };

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="text-center py-8">Loading...</div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarWrapper
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-6">
                  <div className="min-w-0">
                    <h1 className="text-3xl font-semibold leading-tight">
                      Laporan Bisnis
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Analisis performa dan statistik bisnis laundry
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-auto lg:flex-row lg:items-center lg:gap-4 lg:shrink-0 mt-2 lg:mt-0">
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="7">Minggu Ini</SelectItem>
                        <SelectItem value="30">1 Bulan Terakhir</SelectItem>
                        <SelectItem value="90">3 Bulan Terakhir</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      className="w-full lg:w-auto"
                      onClick={() => exportReport("excel")}
                    >
                      <IconDownload className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                  </div>
                </div>

                {reportData && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                              <p className="text-2xl font-bold">{reportData.totalTransactions}</p>
                            </div>
                            <IconTrendingUp className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                              <p className="text-2xl font-bold">Rp. {reportData.totalRevenue.toLocaleString('id-ID')}</p>
                            </div>
                            <IconCurrencyDollar className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Member</p>
                              <p className="text-2xl font-bold">{reportData.totalMembers}</p>
                            </div>
                            <IconUsers className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Rata-rata Transaksi</p>
                              <p className="text-2xl font-bold">Rp. {reportData.avgTransactionValue.toLocaleString('id-ID')}</p>
                            </div>
                            <IconCalendar className="h-8 w-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mb-6">
                      <ChartAreaInteractive chartData={reportData.chartData} />
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                        <CardDescription>
                          Daftar transaksi dalam {period} hari terakhir
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice</TableHead>
                              <TableHead>Member</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Detail Paket</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.transactions.map((transaction) => {
                              // Calculate total using same logic as PHP
                              const subtotal = transaction.tb_detail_transaksi?.reduce((sum: number, detail: any) => {
                                return sum + ((detail.qty || 0) * (detail.tb_paket?.harga || 0));
                              }, 0) || 0;
                              
                              const biayaTambahan = transaction.biaya_tambahan || 0;
                              const diskonPercent = transaction.diskon || 0;
                              const pajakPercent = transaction.pajak || 11;
                              
                              const baseAmount = subtotal + biayaTambahan;
                              const diskonValue = baseAmount * (diskonPercent / 100);
                              const afterDiscount = Math.max(0, baseAmount - diskonValue);
                              const pajakValue = afterDiscount * (pajakPercent / 100);
                              const total = afterDiscount + pajakValue;
                              
                              return (
                                <TableRow key={transaction.id}>
                                  <TableCell className="font-mono">{transaction.kode_invoice}</TableCell>
                                  <TableCell>{transaction.tb_member?.nama || 'Guest'}</TableCell>
                                  <TableCell>{new Date(transaction.tgl).toLocaleDateString('id-ID')}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {transaction.tb_detail_transaksi?.map((detail: any, idx: number) => (
                                        <div key={idx} className="text-sm">
                                          {detail.tb_paket?.nama_paket || 'Paket'} x{detail.qty}
                                        </div>
                                      )) || <span className="text-muted-foreground">No details</span>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={transaction.status === 'selesai' ? 'default' : 'secondary'}>
                                      {transaction.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>Rp. {total.toLocaleString('id-ID')}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  );
}
