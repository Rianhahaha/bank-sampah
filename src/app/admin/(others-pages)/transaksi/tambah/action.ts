'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type ItemTransaksi = {
  sampah_id: number;
  berat: number;
}

export async function createTransaksi(nasabah_id: number, items: ItemTransaksi[]) {
  const supabase = await createClient()

  if (!nasabah_id || items.length === 0) {
    return { success: false, message: "Data transaksi tidak boleh kosong!" }
  }

  try {
    const sampahIds = items.map(item => item.sampah_id)
    const { data: listSampah, error: errSampah } = await supabase
      .from('sampah')
      .select('id, harga_per_satuan')
      .in('id', sampahIds)

    if (errSampah || !listSampah) throw new Error("Gagal mengambil data harga sampah.")

    const hargaMap = new Map(listSampah.map(s => [s.id, s.harga_per_satuan]))

    let totalRupiahHeader = 0
    const detailPayload = []

    for (const item of items) {
      const hargaSaatIni = hargaMap.get(item.sampah_id)
      
      if (typeof hargaSaatIni === 'undefined') {
        throw new Error(`Harga untuk sampah ID ${item.sampah_id} tidak ditemukan.`)
      }

      const subtotal = item.berat * hargaSaatIni
      totalRupiahHeader += subtotal

      detailPayload.push({
        sampah_id: item.sampah_id,
        berat: item.berat,
        harga_satuan_saat_ini: hargaSaatIni,
        subtotal: subtotal
      })
    }

    const { data: transaksiBaru, error: errHeader } = await supabase
      .from('transaksi')
      .insert({
        nasabah_id: nasabah_id,
        total_harga: totalRupiahHeader,
        jenis: 'SETOR'
      })
      .select()
      .single()

    if (errHeader) throw new Error("Gagal membuat header transaksi: " + errHeader.message)

    const finalDetailPayload = detailPayload.map(d => ({
      ...d,
      transaksi_id: transaksiBaru.id
    }))

    const { error: errDetail } = await supabase
      .from('transaksi_detail')
      .insert(finalDetailPayload)

    if (errDetail) {
      await supabase.from('transaksi').delete().eq('id', transaksiBaru.id)
      throw new Error("Gagal menyimpan rincian sampah: " + errDetail.message)
    }

    const { data: nasabahData } = await supabase
        .from('nasabah')
        .select('saldo')
        .eq('id', nasabah_id)
        .single()
    
    const saldoBaru = (nasabahData?.saldo || 0) + totalRupiahHeader

    const { error: errSaldo } = await supabase
        .from('nasabah')
        .update({ saldo: saldoBaru })
        .eq('id', nasabah_id)

    if (errSaldo) {
         console.error("CRITICAL: Saldo gagal update", errSaldo)
    }

    revalidatePath('/admin/transaksi')
    revalidatePath('/admin/nasabah')
    
    return { success: true, message: `Transaksi Berhasil! Total: Rp ${totalRupiahHeader.toLocaleString('id-ID')}` }

  } catch (error: any) {
    return { success: false, message: error.message }
  }
}