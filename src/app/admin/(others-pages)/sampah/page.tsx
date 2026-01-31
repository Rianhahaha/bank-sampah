

import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import SampahPage from './sampahPage';
export const metadata: Metadata = {
    title: "Bank Sampah | Sampah",
};
export default async function page() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('sampah')
        .select('*')

    if (error) {
        console.error("WADUH ERROR:", error.message, error.hint, error.details);
    }

    return (
     
            <SampahPage data={data || []} />

    )
}
