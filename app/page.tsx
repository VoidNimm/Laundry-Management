import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import prisma from "@/lib/prisma";
import data from "./data.json";

async function getLaundryData() {
  // Get transactions with details for proper calculation
  const transactions = await prisma.tb_transaksi.findMany({
    include: {
      tb_detail_transaksi: {
        include: {
          tb_paket: {
            select: {
              harga: true,
            },
          },
        },
      },
    },
  });
  
  const totalTransactions = transactions.length;

  // Calculate total revenue using proper calculation logic
  const totalRevenue = transactions.reduce((acc: number, t: any) => {
    // Calculate subtotal from transaction details
    const subtotal = t.tb_detail_transaksi.reduce((sum: number, detail: any) => {
      return sum + ((detail.qty || 0) * (detail.tb_paket?.harga || 0));
    }, 0);
    
    const biayaTambahan = t.biaya_tambahan || 0;
    const diskonPercent = t.diskon || 0;
    const pajakPercent = t.pajak || 11;
    
    // Calculate discount as percentage of (subtotal + biaya tambahan)
    const baseAmount = subtotal + biayaTambahan;
    const diskonValue = baseAmount * (diskonPercent / 100);
    const afterDiscount = Math.max(0, baseAmount - diskonValue);
    const pajakValue = afterDiscount * (pajakPercent / 100);
    const total = afterDiscount + pajakValue;
    
    return acc + total;
  }, 0);
  
  // Calculate average income
  const avgIncome = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Calculate packages sold from transaction details
  const packagesSold = transactions.reduce((acc: number, t: any) => {
    const totalQty = t.tb_detail_transaksi.reduce((sum: number, detail: any) => {
      return sum + (detail.qty || 0);
    }, 0);
    return acc + totalQty;
  }, 0);

  const newCustomers = (await prisma.tb_transaksi.findMany({
    select: {
      id_member: true,
    },
    distinct: ['id_member'],
  })).length;

  // Get transactions from last 3 months for dashboard chart
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentTransactions = await prisma.tb_transaksi.findMany({
    where: {
      tgl: {
        gte: threeMonthsAgo
      }
    },
    select: {
      tgl: true
    }
  });

  // Group by date
  const dateMap = new Map<string, number>();
  
  // Initialize all dates in the last 3 months with 0
  const currentDate = new Date();
  const daysInPeriod = Math.ceil((currentDate.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(threeMonthsAgo);
    date.setDate(threeMonthsAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, 0);
  }
  
  // Count transactions per date
  recentTransactions.forEach(t => {
    const dateStr = t.tgl.toISOString().split('T')[0];
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });
  
  // Convert to array and sort
  const chartData = Array.from(dateMap.entries())
    .map(([date, transactions]) => ({ date, transactions }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate daily revenue from transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyRevenueResult = await prisma.tb_transaksi.aggregate({
    where: {
      tgl: {
        gte: today,
        lt: tomorrow
      },
      dibayar: 'dibayar'
    },
    _sum: {
      biaya_tambahan: true
    }
  });

  // Calculate monthly revenue from transactions
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const monthlyRevenueResult = await prisma.tb_transaksi.aggregate({
    where: {
      tgl: {
        gte: startOfMonth,
        lt: endOfMonth
      },
      dibayar: 'dibayar'
    },
    _sum: {
      biaya_tambahan: true
    }
  });

  return {
    totalRevenue,
    totalTransactions,
    newCustomers,
    avgIncome,
    packagesSold,
    chartData,
    dailyRevenue: dailyRevenueResult._sum.biaya_tambahan || 0,
    monthlyRevenue: monthlyRevenueResult._sum.biaya_tambahan || 0,
  };
}

export default async function Page() {
  const laundryData = await getLaundryData();

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
              <SectionCards data={laundryData} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive chartData={laundryData.chartData} />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  );
}