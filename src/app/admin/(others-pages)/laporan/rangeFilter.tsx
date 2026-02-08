'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import Label from '@/components/form/Label'
// Pastikan import path ini sesuai lokasi komponen DatePicker kamu
import DatePicker from '@/components/form/date-picker'
export default function DateRangeFilter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // 1. Ambil params dari URL buat Default Value
  const initialStart = searchParams.get('start')
  const initialEnd = searchParams.get('end')

  // State untuk menyimpan range sementara [Date, Date]
  // Kita isi default-nya dari URL kalau ada
  const [dateRange, setDateRange] = useState<Date[]>([])
  const [isPending, setIsPending] = useState(false)

  // Fungsi helper buat format Date Object ke "YYYY-MM-DD"
  // Flatpickr balikin Date object asli, jadi kita harus format manual biar aman di URL
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
    
    // Cek apakah user sudah pilih Range (Start & End)
    if (dateRange.length === 2) {
        const startStr = formatDate(dateRange[0])
        const endStr = formatDate(dateRange[1])

        params.set('start', startStr)
        params.set('end', endStr)
    } else {
        // Kalau range dikosongin/direset
        params.delete('start')
        params.delete('end')
    }

    replace(`${pathname}?${params.toString()}`)
    setTimeout(() => setIsPending(false), 500)
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
      
      <div className="w-full sm:min-w-[300px]">
        {/* Label di sini opsional karena DatePicker kamu udah punya props label */}
        <DatePicker
            id="range-picker"
            label="Pilih Rentang Tanggal"
            placeholder="Mulai - Selesai"
            mode="range" 
            defaultDate={initialStart && initialEnd ? [initialStart, initialEnd] : undefined}
            
            onChange={(selectedDates: Date[]) => {
                setDateRange(selectedDates)
            }}
        />
      </div>

      <button 
        onClick={handleFilter}
        disabled={isPending}
        className="main-button h-[44px] px-6 flex items-center gap-2 mb-[1px]" // mb-[1px] buat alignment visual
      >
        {isPending ? <Loader2 className="animate-spin size-4" /> : <Filter className="size-4" />}
        Tampilkan
      </button>
    </div>
  )
}