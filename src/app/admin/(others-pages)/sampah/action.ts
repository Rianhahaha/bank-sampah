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
    // last_updated : formData.get('last_updated') as string,
    foto_sampah: formData.get('foto_sampah') as File,
  }

  // Validasi simpel (biar gak kosong melompong)
  if (!rawFormData.nama_sampah || !rawFormData.harga_per_satuan) {
    throw new Error("Nama dan Harga Per Satuan wajib diisi!")
  }

  const updateData: any = {
    nama_sampah: rawFormData.nama_sampah,
    harga_per_satuan: rawFormData.harga_per_satuan,
    satuan: rawFormData.satuan,
    last_updated: new Date().toISOString(),
    // foto_sampah: rawFormData.foto_sampah
  }

  if (rawFormData.foto_sampah && rawFormData.foto_sampah.size > 0) {
    const fileName = generateFileName(rawFormData.foto_sampah.name)

    // 1. Upload foto baru
    const { error: uploadError } = await supabase.storage
      .from('foto_sampah')
      .upload(fileName, rawFormData.foto_sampah)

    if (uploadError) return { success: false, message: "Gagal upload foto baru" }

    // 2. Dapatkan URL baru
    const { data: urlData } = supabase.storage
      .from('foto_sampah')
      .getPublicUrl(fileName)

    updateData.foto_sampah = urlData.publicUrl // Update URL di object data

    // (Opsional) Hapus foto lama biar hemat storage?
    // Kamu perlu query dulu data lama buat dapet nama filenya kalau mau hapus.
  }

  const { error } = await supabase
    .from('sampah')
    .update(updateData)
    .eq('id', id)

if (error) {
    // 1. Log error lengkap di terminal server (VS Code)
    console.error("❌ ERROR DELETE NASABAH:", error)
    

    // 3. Kembalikan pesan asli dari Supabase biar ketahuan errornya apa
    return { success: false, message: `Gagal: ${error.message} (Code: ${error.code})` }
  }

  // Refresh data di halaman daftar sampah
  revalidatePath('/admin/sampah')
  // redirect('/admin/sampah')
    return { success: true, message: "Sampah berhasil diperbarui!" };
}

export async function deleteSampah(id: number) {
  const supabase = await createClient()

  // 1. AMBIL DATA DULU (Buat dapet URL fotonya)
  const { data: dataLama, error: fetchError } = await supabase
    .from('sampah')
    .select('foto_sampah')
    .eq('id', id)
    .single()

  if (fetchError) {
    return { success: false, message: "Gagal mengambil data sampah." }
  }

  // 2. COBA HAPUS DATA DI DATABASE
  const { error: deleteDbError } = await supabase
    .from('sampah')
    .delete()
    .eq('id', id)

  if (deleteDbError) {
    console.error("DB Error:", deleteDbError)
    // Cek constraint foreign key
    if (deleteDbError.code === '23503') {
       return { 
         success: false, 
         message: "Gagal: Sampah ini masih dipakai di transaksi. Hapus transaksinya dulu." 
       }
    }
    return { success: false, message: "Gagal menghapus data sampah." }
  }

  // 3. JIKA DB SUKSES HAPUS -> HAPUS FILE DI STORAGE
  // Cek dulu apakah dia punya foto? (Bukan null/string kosong)
if (dataLama?.foto_sampah) {
    const fotoUrl = dataLama.foto_sampah
    const bucketName = 'foto_sampah' // Pastikan sama persis dengan nama di dashboard!

    // CARA AMAN PARSING URL:
    // Kita cari posisi nama bucket, lalu ambil teks setelahnya.
    // URL biasanya: .../storage/v1/object/public/foto_sampah/nama-file.jpg
    
    const targetPath = `/${bucketName}/` 
    const parts = fotoUrl.split(targetPath)

    if (parts.length > 1) {
        // Ambil bagian belakang (nama file kotor)
        let rawFileName = parts[1] 
        
        // 1. Bersihkan sisa slash di depan (jika ada)
        if (rawFileName.startsWith('/')) {
            rawFileName = rawFileName.slice(1)
        }

        // 2. Decode URL (Ubah %20 jadi spasi, dll)
        const cleanFileName = decodeURIComponent(rawFileName)

        console.log("🗑️ MENGHAPUS FILE:", cleanFileName) // Cek log ini di terminal!

        const { data, error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([cleanFileName]) // Kirim nama yang sudah bersih

        if (storageError) {
            console.error("Gagal hapus storage:", storageError)
        } else {
            console.log("Status Hapus:", data) // Cek apakah data kosong atau ada isinya
        }
    }
}

  revalidatePath('/admin/sampah')
  return { success: true, message: "Sampah dan fotonya berhasil dihapus!" };
}
