'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateFileName(originalName: string) {
  const fileExt = originalName.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  return fileName
}

export async function createSampah(formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const rawFormData = {
    nama_sampah: formData.get('nama_sampah') as string,
    harga_per_satuan: formData.get('harga_per_satuan') as string,
    satuan: formData.get('satuan') as string,
    foto_sampah: formData.get('foto_sampah') as File,
  }
  // Validasi simpel (biar gak kosong melompong)
  if (!rawFormData.nama_sampah || !rawFormData.harga_per_satuan) {
    throw new Error("Nama dan RT wajib diisi!")
  }
let fotoUrl = null

  // --- LOGIKA UPLOAD FOTO ---
  // Cek apakah ada file dan ukurannya > 0
  if (rawFormData.foto_sampah && rawFormData.foto_sampah.size > 0) {
    const fileName = generateFileName(rawFormData.nama_sampah)
    
    // 1. Upload ke Bucket 'foto-sampah'
    const { error: uploadError } = await supabase.storage
      .from('foto_sampah')
      .upload(fileName, rawFormData.foto_sampah)

    if (uploadError) {
      return { success: false, message: `Gagal upload foto: ${uploadError.message}` }
    }

    // 2. Ambil Public URL-nya buat disimpan di DB
    const { data: urlData } = supabase.storage
      .from('foto_sampah')
      .getPublicUrl(fileName)
      
    fotoUrl = urlData.publicUrl
  }


  const { error } = await supabase
    .from('sampah')
    .insert([
      { 
        nama_sampah: rawFormData.nama_sampah, 
        harga_per_satuan: rawFormData.harga_per_satuan, 
        satuan: rawFormData.satuan,
        foto_sampah: fotoUrl,
      }
    ])

  if (error) return { success: false, message: error.message };

  // Refresh data di halaman daftar nasabah
  revalidatePath('/admin/sampah')
  // Balikin ke halaman daftar
  // redirect('/admin/nasabah')
  return { success: true, message: "Sampah berhasil ditambahkan!" };
}

export async function updateSampah(formData: FormData, id: number) {
  const supabase = await createClient()
  // Ambil data dari form
  const rawFormData = {
    nama_sampah: formData.get('nama_sampah') as string,
    harga_per_satuan: formData.get('harga_per_satuan') as string,
    satuan: formData.get('satuan') as string,
  }

  // Validasi simpel (biar gak kosong melompong)
  if (!rawFormData.nama_sampah || !rawFormData.harga_per_satuan) {
    throw new Error("Nama dan Harga Per Satuan wajib diisi!")
  }

  const { error } = await supabase
    .from('sampah')
    .update({
      nama_sampah: rawFormData.nama_sampah,
      harga_per_satuan: rawFormData.harga_per_satuan,
      satuan: rawFormData.satuan
    })
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error("Update Sampah Gagal.")
  }

  // Refresh data di halaman daftar sampah
  revalidatePath('/admin/sampah')
  // redirect('/admin/sampah')
    return { success: true, message: "Sampah berhasil diperbarui!" };
}

export async function deleteSampah(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sampah')
    .delete()
    .eq('id', id)
  if (error) {
    console.error(error)
    throw new Error("Hapus Sampah Gagal.")
  }
    revalidatePath('/admin/sampah')
    return { success: true, message: "Sampah berhasil dihapus!" };
}
