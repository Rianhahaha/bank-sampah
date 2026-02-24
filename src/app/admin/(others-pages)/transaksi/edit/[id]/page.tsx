import { createClient } from '@/utils/supabase/server'
import EditTransaksiPage from './editTransaksiPage';

// 1. Tipe params sekarang adalah Promise
export default async function Page({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    // 2. AWAIT dulu params-nya sebelum dipakai!
    const { id } = await params; 

    const supabase = await createClient()

    // 3. Tarik Data Transaksi Lama
    const { data: transaksi } = await supabase
        .from('transaksi')
        .select(`
            id, 
            nasabah_id,
            transaksi_detail (
                id, sampah_id, berat, subtotal, harga_satuan_saat_ini,
                sampah ( nama_sampah, satuan )
            )
        `)
        .eq('id', id) // <--- Pakai variabel 'id' yang sudah di-await
        .single();

    // ... (Sisa kodingan tarik master data ke bawah tetap sama) ...
    const { data: listNasabah } = await supabase.from('nasabah').select('id, nama, alamat, rt, saldo')
    const { data: listSampah } = await supabase.from('sampah').select('*')

    if (!transaksi) return <div>Data tidak ditemukan.</div>;

    return (
        <EditTransaksiPage 
            transaksi={transaksi as any} 
            listNasabah={listNasabah || []} 
            listSampah={listSampah || []} 
        />
    )
}