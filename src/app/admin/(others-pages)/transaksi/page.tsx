

import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import TransaksiPage from './transaksiPage';
import { getTransaksi } from '@/data/transaksi';
import { Transaksi } from '@/types';
export const metadata: Metadata = {
    title: "Bank Sampah | Transaksi",
};
export default async function page() {
    const data = await getTransaksi();

    return (
        <TransaksiPage data={data || []} />
    )
}
 