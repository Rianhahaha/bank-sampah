// src/data/laporan.ts
import { createClient } from '@/utils/supabase/server'
import { Transaksi } from '@/types' // Pastikan type Transaksi ada

export async function getLaporanTransaksi(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('transaksi')
    .select(`
      id,
      created_at,
      total_harga,
      jenis,
      nasabah ( nama )
    `)
    .order('created_at', { ascending: false })

  // Apply Filter JIKA ada tanggalnya
  if (startDate && endDate) {
    // Trik: End Date harus di-set ke akhir hari (23:59:59) biar data hari itu kebawa
    const endDateTime = `${endDate}T23:59:59`
    
    query = query
      .gte('created_at', startDate)
      .lte('created_at', endDateTime)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error Fetching Laporan:", error)
    throw new Error(error.message)
  }

  // Casting type sesuai kebutuhan
  return data as unknown as Transaksi[]
}