
// src/data/dashboard.ts
import { createClient } from '@/utils/supabase/server'
import { Nasabah } from '@/types' // Asumsi kamu punya type ini

export async function getDashboardStats() {
  const supabase = await createClient()

  // Kita jalankan semua request secara PARALEL biar ngebut
  const [
    totalNasabahRes, 
    totalTransaksiRes, 
    recentNasabahRes,
    totalSampahRes,
  ] = await Promise.all([
    
    // 1. Hitung Total Nasabah (Cuma minta angka, gak minta data)
    supabase.from('nasabah').select('*', { count: 'exact', head: true }),

    // 2. Hitung Total Transaksi (Cuma minta angka)
    supabase.from('transaksi').select('*', { count: 'exact', head: true }),

    // 3. Ambil 5 Nasabah Terbaru
    supabase.from('nasabah')
      .select('id, nama, created_at, saldo') // Ambil kolom yg perlu aja!
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('sampah').select('*', { count: 'exact', head: true }),

  ])


  // Return datanya dalam satu paket rapi
  return {
    totalNasabah: totalNasabahRes.count || 0,
    totalTransaksi: totalTransaksiRes.count || 0,
    recentNasabah: (recentNasabahRes.data || []) as Partial<Nasabah>[],
    totalSampah: totalSampahRes.count || 0,
  }
}

export async function getMonthlySalesStats(year: number) {
  const supabase = await createClient()

  // 1. Ambil data transaksi di tahun yang diminta
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31 23:59:59`

  const { data, error } = await supabase
    .from('transaksi')
    .select('created_at, total_harga')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) {
    console.error("Error fetching monthly sales:", error)
    return Array(12).fill(0) // Balikin array 0 semua kalau error
  }

  // 2. Siapkan Wadah 12 Bulan (Index 0 = Jan, 11 = Des)
  // Isi default 0 semua
  const monthlyTotals = Array(12).fill(0)

  // 3. Masukkan data ke wadah bulan yang sesuai
  data?.forEach((trx) => {
    const date = new Date(trx.created_at)
    const monthIndex = date.getMonth() // 0 untuk Januari, 1 untuk Februari, dst.
    
    // Akumulasi total harga
    monthlyTotals[monthIndex] += Number(trx.total_harga)
  })

  return monthlyTotals
}