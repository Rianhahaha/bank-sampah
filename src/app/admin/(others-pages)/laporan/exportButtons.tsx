'use client'
import React from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileSpreadsheet, FileText } from 'lucide-react' 
import { Transaksi } from '@/types' 

interface ExportButtonsProps {
  data: Transaksi[];
  fileName?: string;
}

export default function ExportButtons({ data, fileName = 'Laporan-Transaksi' }: ExportButtonsProps) {

  // --- LOGIKA EXCEL ---
  const handleExportExcel = () => {
    const excelData = data.map((item, index) => {
      
      const details = Array.isArray(item.transaksi_detail) 
          ? item.transaksi_detail 
          : [];

      const rincianText = details
          .map((d: any) => {
              const nama = d.sampah?.nama_sampah || 'Sampah Hapus';
              const berat = d.berat || 0;
              const satuan = d.sampah?.satuan || 'kg';
              
              return `- ${nama} (${berat} ${satuan})`; 
          })
          .join('\n'); 

      return {
        No: index + 1,
        'Tanggal': new Date(item.created_at).toLocaleDateString('id-ID'),
        'Nama Nasabah': item.nasabah?.nama || '-',
        'Rincian Sampah': rincianText, 
        'Total Rupiah': item.total_harga
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Sedikit styling biar kolom Rincian agak lebar di Excel
    // wch = width chars (jumlah karakter)
    const columnWidths = [
        { wch: 5 },  // No
        { wch: 15 }, // Tanggal
        { wch: 20 }, // Nama
        { wch: 40 }, // Rincian (Lebarin biar enak)
        { wch: 15 }  // Total
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  // --- LOGIKA PDF (SUDAH DISAMAKAN) ---
  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Judul
    doc.text('Laporan Transaksi Bank Sampah', 14, 10);
    
    // 1. Samakan Header Kolom dengan Excel
    const tableColumn = ["No", "Tanggal", "Nama Nasabah", "Rincian Sampah", "Total (Rp)"];

    // 2. Map Data (Logika rincianText dicopas kesini)
    const tableRows = data.map((item, index) => {
      
      // -- LOGIC RINCIAN SAMPAH (Sama persis kayak Excel) --
      const details = Array.isArray(item.transaksi_detail) 
          ? item.transaksi_detail 
          : [];

      const rincianText = details
          .map((d: any) => {
              const nama = d.sampah?.nama_sampah || 'Sampah Hapus';
              const berat = d.berat || 0;
              const satuan = d.sampah?.satuan || 'kg';
              
              // Kasih strip (-) biar di PDF kelihatan kayak list bullet point
              return `- ${nama} (${berat} ${satuan})`; 
          })
          .join('\n'); // Enter ini akan dibaca otomatis oleh autoTable
      // ----------------------------------------------------

      return [
        index + 1,
        new Date(item.created_at).toLocaleDateString('id-ID'),
        item.nasabah?.nama || '-',
        rincianText, // Masukkan string enter tadi
        `Rp ${item.total_harga.toLocaleString('id-ID')}`
      ]
    });

    // Generate Tabel Otomatis
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { 
        fontSize: 9, 
        valign: 'top', // Teks rata atas biar rapi kalau barisnya tinggi
        overflow: 'linebreak' // Pastikan teks turun ke bawah kalau kepanjangan
      }, 
      headStyles: { fillColor: [22, 163, 74] }, // Hijau
      // Opsional: Atur lebar kolom spesifik jika Rincian terlalu sempit
      columnStyles: {
        3: { cellWidth: 70 } // Index 3 adalah kolom Rincian Sampah, kita kasih lebar extra
      }
    })

    // Save
    doc.save(`${fileName}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
      >
        <FileSpreadsheet className="size-4" />
        Export Excel
      </button>

      <button 
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
      >
        <FileText className="size-4" />
        Export PDF
      </button>
    </div>
  )
}