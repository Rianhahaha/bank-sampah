// src/components/laporan/LaporanTable.tsx
import { Transaksi } from '@/types'

export default function LaporanTable({ data }: { data: Transaksi[] }) {
  if (data.length === 0) {
    return <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">Tidak ada data pada rentang tanggal ini.</div>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Tanggal</th>
            <th className="px-6 py-3">Nasabah</th>
            {/* <th className="px-6 py-3">Jenis</th> */}
            <th className="px-6 py-3 text-right">Total (Rp)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{item.nasabah?.nama || '-'}</td>
              {/* <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.jenis === 'SETOR' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {item.jenis}
                </span>
              </td> */}
              <td className="px-6 py-4 text-right font-bold text-gray-700">
                Rp {item.total_harga.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}