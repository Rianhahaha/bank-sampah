'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'


// action.ts

export async function deleteTransaksi(transaksi_id: number, nasabah_id: number, total_harga: number) {
    const supabase = await createClient()

    if (!transaksi_id || !nasabah_id) {
        return { success: false, message: "Data tidak valid untuk dihapus." }
    }

    try {
        // 1. Tarik kembali (revert) saldo nasabah
        const { data: nasabahData } = await supabase
            .from('nasabah')
            .select('saldo')
            .eq('id', nasabah_id)
            .single()
        
        const saldoBaru = (nasabahData?.saldo || 0) - total_harga

        const { error: errSaldo } = await supabase
            .from('nasabah')
            .update({ saldo: saldoBaru })
            .eq('id', nasabah_id)

        if (errSaldo) throw new Error("Gagal mengembalikan saldo nasabah.")

        // 2. Hapus detail transaksi (Jaga-jaga kalau DB kamu belum pakai Cascade Delete)
        await supabase.from('transaksi_detail').delete().eq('transaksi_id', transaksi_id)

        // 3. Hapus transaksi utama
        const { error: errDelete } = await supabase
            .from('transaksi')
            .delete()
            .eq('id', transaksi_id)

        if (errDelete) throw new Error("Gagal menghapus transaksi: " + errDelete.message)

        // 4. Refresh halaman
        revalidatePath('/admin/transaksi')
        revalidatePath('/admin/nasabah')

        return { success: true, message: "Transaksi berhasil dihapus & Saldo telah disesuaikan!" }

    } catch (error: any) {
        return { success: false, message: error.message }
    }
}