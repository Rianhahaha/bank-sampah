

import { Metadata } from 'next';
import NasabahPage from './nasabahPage';
import { createClient } from '@/utils/supabase/server';
export const metadata: Metadata = {
    title: "Bank Sampah | Nasabah",
};
export default async function page() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('nasabah')
        .select('*')

    if (error) {
        console.error("WADUH ERROR:", error.message, error.hint, error.details);
    }


    return (
        <>
            <NasabahPage data={data || []} />
        </>
    )
}
