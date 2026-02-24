'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type ItemTransaksi = {
  sampah_id: number;
  berat: number;
}
export async function updateTransaksi(transaksi_id: number, nasabah_id: number, items: ItemTransaksi[]) {
  const supabase = await createClient()

  if (!transaksi_id || !nasabah_id || items.length === 0) {
    return { success: false, message: "Data update tidak lengkap (ID Transaksi, Nasabah, atau Keranjang kosong)!" }
  }

  try {
    // 1. Ambil data transaksi lama buat narik balik (revert) saldo nasabah
    const { data: trxLama, error: errTrxLama } = await supabase
      .from('transaksi')
      .select('nasabah_id, total_harga')
      .eq('id', transaksi_id)
      .single()

    if (errTrxLama || !trxLama) throw new Error("Transaksi lama tidak ditemukan.")

    // 2. Hitung Ulang Keranjang Baru (Sama kayak create)
    const sampahIds = items.map(item => item.sampah_id)
    const { data: listSampah, error: errSampah } = await supabase
      .from('sampah')
      .select('id, harga_per_satuan')
      .in('id', sampahIds)

    if (errSampah || !listSampah) throw new Error("Gagal mengambil data harga sampah.")

    const hargaMap = new Map(listSampah.map(s => [s.id, s.harga_per_satuan]))

    let totalRupiahBaru = 0
    const detailPayload = []

    for (const item of items) {
      const hargaSaatIni = hargaMap.get(item.sampah_id)
      
      if (typeof hargaSaatIni === 'undefined') {
        throw new Error(`Harga untuk sampah ID ${item.sampah_id} tidak ditemukan.`)
      }

      const subtotal = item.berat * hargaSaatIni
      totalRupiahBaru += subtotal

      detailPayload.push({
        transaksi_id: transaksi_id, // Langsung kaitkan ke ID transaksi yang diupdate
        sampah_id: item.sampah_id,
        berat: item.berat,
        harga_satuan_saat_ini: hargaSaatIni,
        subtotal: subtotal
      })
    }

    // --- MULAI OPERASI DATABASE YANG RAWAN ---

    // 3. TARIK SALDO LAMA (Biar nggak dobel uangnya)
    const { data: nasabahLama } = await supabase.from('nasabah').select('saldo').eq('id', trxLama.nasabah_id).single()
    const revertSaldo = (nasabahLama?.saldo || 0) - trxLama.total_harga
    await supabase.from('nasabah').update({ saldo: revertSaldo }).eq('id', trxLama.nasabah_id)

    // 4. HAPUS DETAIL LAMA & UPDATE HEADER TRANSAKSI
    await supabase.from('transaksi_detail').delete().eq('transaksi_id', transaksi_id)
    
    const { error: errUpdateHeader } = await supabase
      .from('transaksi')
      .update({
        nasabah_id: nasabah_id,
        total_harga: totalRupiahBaru,
      })
      .eq('id', transaksi_id)

    if (errUpdateHeader) throw new Error("Gagal update header transaksi.")

    // 5. INSERT DETAIL BARU
    const { error: errDetail } = await supabase.from('transaksi_detail').insert(detailPayload)
    if (errDetail) throw new Error("Gagal menyimpan rincian sampah baru: " + errDetail.message)

    // 6. TAMBAH SALDO BARU (Bisa ke nasabah yang sama, atau nasabah baru kalau di-edit)
    const { data: nasabahBaru } = await supabase.from('nasabah').select('saldo').eq('id', nasabah_id).single()
    const saldoBaru = (nasabahBaru?.saldo || 0) + totalRupiahBaru
    
    const { error: errSaldoBaru } = await supabase.from('nasabah').update({ saldo: saldoBaru }).eq('id', nasabah_id)

    // console.log("DEBUG: Update Transaksi Sukses. Revert Saldo:", revertSaldo, "Saldo Baru:", saldoBaru)
    
    if (errSaldoBaru) console.error("CRITICAL: Saldo baru gagal update", errSaldoBaru)

    // Revalidate biar UI langsung refresh
    revalidatePath('/admin/transaksi')
    revalidatePath('/admin/nasabah')
    
    return { success: true, message: `Transaksi Berhasil Diupdate! Total Baru: Rp ${totalRupiahBaru.toLocaleString('id-ID')}` }

  } catch (error: any) {
    return { success: false, message: error.message }
  }
}