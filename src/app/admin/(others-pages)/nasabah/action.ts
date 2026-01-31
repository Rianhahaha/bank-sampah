'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNasabah(formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const rawFormData = {
    nama: formData.get('nama') as string,
    alamat: formData.get('alamat') as string,
    rt: formData.get('rt') as string,
  }
  // Validasi simpel (biar gak kosong melompong)
  if (!rawFormData.nama || !rawFormData.rt) {
    throw new Error("Nama dan RT wajib diisi!")
  }

  const { error } = await supabase
    .from('nasabah')
    .insert([
      { 
        nama: rawFormData.nama, 
        alamat: rawFormData.alamat, 
        rt: rawFormData.rt, 
        saldo: 0 
      }
    ])

  if (error) return { success: false, message: error.message };

  // Refresh data di halaman daftar nasabah
  revalidatePath('/admin/nasabah')
  // Balikin ke halaman daftar
  // redirect('/admin/nasabah')
  return { success: true, message: "Nasabah berhasil ditambahkan!" };
}

export async function updateNasabah(formData: FormData, id: number) {
  const supabase = await createClient()
  // Ambil data dari form
  const rawFormData = {
    nama: formData.get('nama') as string,
    alamat: formData.get('alamat') as string,
    rt: formData.get('rt') as string,
  }

  // Validasi simpel (biar gak kosong melompong)
  if (!rawFormData.nama || !rawFormData.rt) {
    throw new Error("Nama dan RT wajib diisi!")
  }

  const { error } = await supabase
    .from('nasabah')
    .update({
      nama: rawFormData.nama,
      alamat: rawFormData.alamat,
      rt: rawFormData.rt
    })
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error("Update Nasabah Gagal.")
  }

  // Refresh data di halaman daftar nasabah
  revalidatePath('/admin/nasabah')
  // redirect('/admin/nasabah')
    return { success: true, message: "Nasabah berhasil diperbarui!" };
}

export async function deleteNasabah(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('nasabah')
    .delete()
    .eq('id', id)
  if (error) {
    console.error(error)
    throw new Error("Hapus Nasabah Gagal.")
  }
    revalidatePath('/admin/nasabah')
    return { success: true, message: "Nasabah berhasil dihapus!" };
}
