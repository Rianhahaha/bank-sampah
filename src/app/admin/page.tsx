import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { Trash2Icon, UsersIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDashboardStats, getMonthlySalesStats } from "@/data/dashboard";

export const metadata: Metadata = {
  title:
    "Bank Sampah | Dashboard",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default async function Ecommerce() {
  const { totalNasabah, totalTransaksi, totalSampah, recentNasabah } = await getDashboardStats()
  const currentYear = new Date().getFullYear()

  // Fetch data untuk chart (Array 12 bulan)
  const monthlySalesData = await getMonthlySalesStats(currentYear)
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        {/* overview */}
        <div className="rounded-2xl border bg-gradien main-gradient p-5  md:p-6">
          <div className="font-semibold text-2xl text-white mb-5">Dashboard</div>
          <div className="flex">
            {/* Item */}
            <div className="flex items-center gap-5 text-white border-r-2 border-white my-4 pr-0 md:pr-5">
              <div className="bg-white/20 p-4 rounded-full">
                <UsersIcon className=" size-8  " />
              </div>
              <div className="flex flex-col leading-[30px]">
                <span>
                  Jumlah Nasabah
                </span>
                <span className="text-[40px] font-bold">
                  {totalNasabah}
                </span>
              </div>
            </div>
            {/* Item */}

            <div className="flex items-center gap-5 text-white pl-0 md:pl-5">
              <div className="bg-white/20 p-4 rounded-full">
                <Trash2Icon className=" size-8  " />
              </div>
              <div className="flex flex-col leading-[30px]">
                <span>
                  Jumlah Jenis Sampah
                </span>
                <span className="text-[40px] font-bold">
                  {totalSampah}
                </span>
              </div>
            </div>
          </div>

        </div>
        {/* <EcommerceMetrics /> */}


        <MonthlySalesChart data={monthlySalesData} year={currentYear} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <div className="h-full p-5 md:p-6 rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          <div className="font-semibold text-2xl text-gray-800 mb-5">Informasi Saldo Nasabah</div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <tr>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        No
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Nama Nasabah
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Saldo
                      </TableCell>

                    </tr>
                  </TableHeader>

                  {/* Table Body */}

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {recentNasabah.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start w-12">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start ">
                          {order.nama}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          Rp {order.saldo?.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

        </div>

        {/* <MonthlyTarget /> */}
      </div>

      {/* <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}
