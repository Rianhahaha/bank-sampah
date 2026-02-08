'use client'
import React from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileSpreadsheet, FileText } from 'lucide-react' // Pastikan punya icon ini
import { Transaksi } from '@/types' // Sesuaikan import tipe data kamu

interface ExportButtonsProps {
  data: Transaksi[];
  fileName?: string;
}

export default function ExportButtons({ data, fileName = 'Laporan-Transaksi' }: ExportButtonsProps) {

  // --- LOGIKA EXCEL ---
  const handleExportExcel = () => {
    // 1. Flatten Data (Ratakan Object)
    // Excel nggak bisa baca object bersarang kayak { nasabah: { nama: 'Budi' } }
    // Jadi harus kita bongkar manual.
    const excelData = data.map((item, index) => ({
      No: index + 1,
      'Nama Nasabah': item.nasabah?.nama || '-',
      'Tanggal': new Date(item.created_at).toLocaleDateString('id-ID'),
    //   'Jenis': item.jenis || 'SETOR',
      'Total Rupiah': item.total_harga // Biarkan angka asli biar bisa dijumlah di Excel
    }))

    // 2. Bikin Worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // 3. Download File
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  // --- LOGIKA PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Judul
    doc.text('Laporan Transaksi Bank Sampah', 14, 10);
    
    // Siapkan Data Tabel
    const tableColumn = ["No", "Nama Nasabah", "Tanggal", "Jenis", "Total (Rp)"];
    const tableRows = data.map((item, index) => [
      index + 1,
      item.nasabah?.nama || '-',
      new Date(item.created_at).toLocaleDateString('id-ID'),
    //   item.jenis || 'SETOR',
      `Rp ${item.total_harga.toLocaleString('id-ID')}` // Format string Rupiah buat PDF
    ]);

    // Generate Tabel Otomatis
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20, // Jarak dari judul
      styles: { fontSize: 8 }, // Biar muat banyak
      headStyles: { fillColor: [22, 163, 74] }, // Warna hijau (biar tema lingkungan)
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