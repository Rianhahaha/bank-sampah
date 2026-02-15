'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Filter, Loader2 } from 'lucide-react'
// Pastikan import path ini sesuai lokasi komponen DatePicker kamu
import DatePicker from '@/components/form/date-picker'

export default function DateRangeFilter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // 1. Ambil params dari URL buat Default Value
  // Kita butuh ini agar saat di-refresh, input tidak kosong
  const initialStart = searchParams.get('start')
  const initialEnd = searchParams.get('end')

  // 2. State untuk menyimpan tanggal masing-masing
  // Kita inisialisasi dengan nilai dari URL (jika ada) biar state sinkron
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStart ? new Date(initialStart) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialEnd ? new Date(initialEnd) : undefined
  )

  const [isPending, setIsPending] = useState(false)

  // Fungsi helper format Date ke "YYYY-MM-DD"
  const formatDate = (date: Date) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleFilter = () => {
    setIsPending(true)
    const params = new URLSearchParams(searchParams)
    
    // Logic Start Date
    if (startDate) {
        params.set('start', formatDate(startDate))
    } else {
        params.delete('start')
    }

    // Logic End Date
    if (endDate) {
        params.set('end', formatDate(endDate))
    } else {
        params.delete('end')
    }

    replace(`${pathname}?${params.toString()}`)
    setTimeout(() => setIsPending(false), 500)
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
      
      {/* INPUT TANGGAL MULAI */}
      <div className="w-full sm:w-auto min-w-[200px]">
        <DatePicker
            id="start-date"
            label="Tanggal Mulai"
            placeholder="Pilih Tanggal"
            // Default value dari URL (String)
            // defaultDate={initialStart || undefined}
            // Flatpickr mengembalikan array dates, kita ambil index ke-0
            onChange={(dates: Date[]) => {
                setStartDate(dates[0])
            }}
        />
      </div>

      {/* INPUT TANGGAL AKHIR */}
      <div className="w-full sm:w-auto min-w-[200px]">
        <DatePicker
            id="end-date"
            label="Tanggal Akhir"
            placeholder="Pilih Tanggal"
            // Default value dari URL (String)
            // defaultDate={initialEnd || undefined} 
            onChange={(dates: Date[]) => {
                setEndDate(dates[0])
            }}
        />
      </div>

      {/* TOMBOL FILTER */}
      <button 
        onClick={handleFilter}
        disabled={isPending}
        className="main-button h-[44px] px-6 flex items-center gap-2 mb-[1px]"
      >
        {isPending ? <Loader2 className="animate-spin size-4" /> : <Filter className="size-4" />}
        Tampilkan
      </button>
    </div>
  )
}