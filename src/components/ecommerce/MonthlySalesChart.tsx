"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons"; // Sesuaikan path icon kamu
import { useState } from "react";

// Dynamically import ReactApexChart
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MonthlySalesChartProps {
    data: number[]; // Array angka penjualan per bulan
    year: number;   // Tahun yang ditampilkan
}

export default function MonthlySalesChart({ data, year }: MonthlySalesChartProps) {
  
  const options: ApexOptions = {
    colors: ["#14B498"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true }, // Legend saya hide aja biar bersih
    yaxis: {
        labels: {
            // Format angka sumbu Y jadi "10jt", "1jt" biar ringkas
            formatter: (value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                return `${value}`;
            }
        }
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }, // Grid vertikal dimatikan biar bersih
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        // Format Tooltip jadi Rupiah
        formatter: (val: number) => `Rp ${val.toLocaleString('id-ID')}`,
      },
    },
  };

  const series = [
    {
      name: "Total Transaksi",
      data: data, // <-- Data dinamis dari props
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Grafik Transaksi ({year})
        </h3>
        
        {/* Dropdown Menu (Opsional - UI Only) */}
        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
           <MoreDotIcon />
        </button>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}