// src/components/laporan/LaporanTable.tsx
import { Transaksi } from '@/types'

export default function LaporanTable({ data }: { data: Transaksi[] }) {
    if (data.length === 0) {
        return <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">Tidak ada data pada rentang tanggal ini.</div>
    }

    return (
        <div className="min-w-[300px] overflow-y-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-3">No</th>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3">Nasabah</th>
                        <th className="px-6 py-3">Jenis Sampah</th>
                        <th className="px-6 py-3 text-right">Total (Rp)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item, index) => {
                        // LOGIC MENGGABUNGKAN NAMA SAMPAH
                        // 1. Map: Ambil nama_sampah aja
                        // 2. Filter: Buang yang kosong (jaga-jaga)
                        // 3. Join: Gabung pake koma
                        const listSampah = item.transaksi_detail
                        //     ?.map((detail) => detail.sampah?.nama_sampah)
                        //     .filter(Boolean) // Hapus yang null/undefined
                        //     .join(', '); // Hasil: "Kardus, Besi, Plastik"

                        //     console.log("list Sampah",listSampah)

                        return (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.nasabah?.nama || '-'}</td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    {listSampah?.map((detail, index) => (

                                        <div
                                            key={index}
                                            className="flex justify-between items-center pb-1"
                                        >
                                            {/* Nama Sampah */}
                                            <span className="text-sm font-medium text-gray-700">
                                                {detail.sampah?.nama_sampah}
                                            </span>

                                            {/* Berat & Satuan */}
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap ml-2">
                                                {detail.berat} {detail.sampah?.satuan}
                                            </span>
                                        </div>


                                    ))}
                                </td>

                                <td className="px-6 py-4 text-right font-bold text-gray-700">
                                    Rp {item.total_harga.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}