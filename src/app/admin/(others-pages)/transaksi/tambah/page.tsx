import React from 'react'
import TransaksiPage from './transaksiPage'
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
export const metadata: Metadata = {
    title: "Bank Sampah | Transaksi",
};

export default async function page() {
    const supabase = await createClient()
    const {data:listNasabah, error:errorNasabah} = await supabase
        .from('nasabah')
        .select('*')
            if (errorNasabah) {
        console.error("WADUH ERROR:", errorNasabah.message, errorNasabah.hint, errorNasabah.details);
    }
    const { data: listSampah, error:errorSampah } = await supabase
        .from('sampah')
        .select('*')
    if (errorSampah) {
        console.error("WADUH ERROR:", errorSampah.message, errorSampah.hint, errorSampah.details);
    }
    return (
        <TransaksiPage listNasabah={listNasabah|| []} listSampah={listSampah || []} />
    )
}
