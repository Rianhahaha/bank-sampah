'use server'
import { DetailTransaksi, Transaksi } from '@/types';
import { createClient } from '@/utils/supabase/server'

export async function getTransaksi() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transaksi')
    .select(`
        id,
        created_at,
        total_harga,      
        nasabah ( nama )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  
  return data as unknown as Transaksi[] ;
}

export async function getDetailTransaksi(id: number) { 
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transaksi_detail')
      .select(`
        id,
        transaksi ( id ),
        sampah(nama_sampah, harga_per_satuan, satuan),
        berat,
        subtotal,
        harga_satuan_saat_ini
        `)
        .order('created_at', { ascending: false })
        .eq('transaksi_id', id);

        if (error) {
            throw new Error(error.message)
        }
          return data as unknown as DetailTransaksi[] ;


}