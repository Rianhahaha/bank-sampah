import DateRangeFilter from './rangeFilter'
import { getLaporanTransaksi } from './action'
import LaporanTable from './LaporanTable'
import ExportButtons from './exportButtons'
import { Metadata } from 'next'
export const metadata: Metadata = {
    title: "Bank Sampah | Laporan",
};
// Definisi props buat Page di Next.js App Router
export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
  // 1. Ambil Start & End dari URL
const startDate = typeof params.start === 'string' ? params.start : undefined
  const endDate = typeof params.end === 'string' ? params.end : undefined
  // 2. Fetch Data (Server Side Fetching)
  // Kalau URL kosong, dia bakal fetch semua (atau logic lain sesuai getLaporanTransaksi)
  const laporanData = await getLaporanTransaksi(startDate, endDate)

  // 3. Hitung Ringkasan (Opsional - biar keren dikit laporannya)
  const totalOmset = laporanData.reduce((acc, curr) => acc + curr.total_harga, 0)

  return (
    <section className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Transaksi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Silakan pilih rentang tanggal untuk mencetak laporan.
          </p>
        </div>
        
        {/* Tombol Export - Hanya muncul kalau ada data */}
        {laporanData.length > 0 && (
          <ExportButtons 
            data={laporanData} 
            fileName={`Laporan-${startDate || 'Semua'}-sd-${endDate || 'Semua'}`} 
          />
        )}
      </div>

      {/* Filter Component */}
      <DateRangeFilter />

      {/* Summary Cards Kecil */}
      {laporanData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="text-sm text-blue-600 font-medium">Total Transaksi</div>
                <div className="text-2xl font-bold text-blue-900">{laporanData.length}</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="text-sm text-green-600 font-medium">Total Nominal</div>
                <div className="text-2xl font-bold text-green-900">Rp {totalOmset.toLocaleString('id-ID')}</div>
            </div>
        </div>
      )}

      {/* Table Display */}
      <LaporanTable data={laporanData} />
    </section>
  )
}