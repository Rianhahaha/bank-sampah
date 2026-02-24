'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'


// action.ts

// action.ts
// action.ts
export async function deleteTransaksi(transaksi_id: number) {
    const supabase = await createClient()

    if (!transaksi_id) {
        return { success: false, message: "ID Transaksi tidak valid." }
    }

    try {
        // --- 1. CARI TAHU INI TRANSAKSI SIAPA DAN BERAPA HARGANYA ---
        const { data: trxLama, error: errTrx } = await supabase
            .from('transaksi')
            .select('nasabah_id, total_harga')
            .eq('id', Number(transaksi_id))
            .single()

        if (errTrx || !trxLama) {
            throw new Error(`Transaksi dengan ID ${transaksi_id} tidak ditemukan di database.`)
        }

        const nasabah_id = trxLama.nasabah_id
        const total_harga = trxLama.total_harga

        // --- 2. AMBIL SALDO NASABAH SAAT INI ---
        const { data: nasabahData, error: errCari } = await supabase
            .from('nasabah')
            .select('saldo, nama')
            .eq('id', nasabah_id) 
            .single()
        
        if (errCari || !nasabahData) {
            throw new Error(`Nasabah pemilik transaksi ini tidak ditemukan.`)
        }

        // --- 3. MATEMATIKA ANTI-BUG ---
        const saldoLama = Number(nasabahData.saldo || 0)
        const hargaRevert = Number(total_harga || 0)
        const saldoBaru = saldoLama - hargaRevert

        // --- 4. UPDATE SALDO NASABAH ---
        const { data: checkUpdate, error: errSaldo } = await supabase
            .from('nasabah')
            .update({ saldo: saldoBaru })
            .eq('id', nasabah_id)
            .select('id, saldo') 
            .single() 

        if (errSaldo || !checkUpdate) {
            throw new Error("Gagal menyimpan saldo baru ke tabel nasabah.")
        }

        // --- 5. EKSEKUSI HAPUS DATA TRANSAKSI ---
        await supabase.from('transaksi_detail').delete().eq('transaksi_id', Number(transaksi_id))

        const { error: errDelete } = await supabase
            .from('transaksi')
            .delete()
            .eq('id', Number(transaksi_id))

        if (errDelete) throw new Error("Gagal menghapus transaksi utama.")

        // --- 6. REFRESH UI ---
        revalidatePath('/admin/transaksi')
        revalidatePath('/admin/nasabah')

        return { success: true, message: `Sukses! Saldo ${nasabahData.nama} dikembalikan jadi Rp ${checkUpdate.saldo.toLocaleString('id-ID')}` }

    } catch (error: any) {
        console.error("[DEBUG FATAL ERROR]", error.message)
        return { success: false, message: error.message }
    }
}