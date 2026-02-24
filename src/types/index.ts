export interface Nasabah {
    id: number;
    nama: string;
    alamat: string;
    rt: string;
    saldo: number;
}

export interface Sampah {
    id: number;
    nama_sampah: string;
    foto_sampah: string;
    rt: string;
    harga_per_satuan: number;
    satuan: string;
    created_at: string;
    last_updated: string;
}


export interface SampahItem {
    tempId: number; // ID sementara buat key di list (karena belum masuk DB)
    sampahId: number;
    namaSampah: string;
    hargaSatuan: number; // Cuma buat display estimasi!
    berat: number;
    subtotal: number;
}

export interface Transaksi {
    id: number;
    created_at: string;
    total_harga: number;
    nasabah: {
        id: number;
        nama: string | null;
    }
    transaksi_detail?: {
        berat?:number;
        subtotal?:number;
        sampah?: {
            nama_sampah?:string
            satuan?:string
        }
    }[]
}
export interface DetailTransaksi {
    id: number;
    created_at: string;
    transaksi:Transaksi;
    sampah: Sampah
    berat: number;
    subtotal: number;
    harga_satuan_saat_ini: number;
}