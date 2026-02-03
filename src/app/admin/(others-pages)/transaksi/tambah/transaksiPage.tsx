'use client'
import React, { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, TrashIcon, Save, ShoppingCart, User, Calculator } from 'lucide-react'
import Image from 'next/image'

import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { createTransaksi } from './action'; 

import { Sampah, Nasabah, SampahItem } from '@/types'



export default function TransaksiPage({ 
    listNasabah, 
    listSampah 
}: { 
    listNasabah: Nasabah[], 
    listSampah: Sampah[] 
}) {
    const [isPending, startTransition] = useTransition();

    // --- STATE UTAMA ---
    const [selectedNasabahId, setSelectedNasabahId] = useState<string>("");
    const [cart, setCart] = useState<SampahItem[]>([]);

    // --- STATE FORM INPUT (Buat nambah item ke keranjang) ---
    const [inputSampahId, setInputSampahId] = useState<string>("");
    const [inputBerat, setInputBerat] = useState<string>("");

    // --- COMPUTED VALUES (Hitungan Otomatis) ---
    
    // Cari object sampah berdasarkan ID yang dipilih user
    const selectedSampah = useMemo(() => {
        return listSampah.find(s => s.id.toString() === inputSampahId);
    }, [inputSampahId, listSampah]);

    // Hitung estimasi subtotal saat ngetik berat
    const estimasiSubtotal = useMemo(() => {
        if (!selectedSampah || !inputBerat) return 0;
        return selectedSampah.harga_per_satuan * parseFloat(inputBerat);
    }, [selectedSampah, inputBerat]);

    // Hitung Grand Total Keranjang
    const grandTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.subtotal, 0);
    }, [cart]);


    // --- HANDLERS ---

    const handleAddToCart = () => {
        if (!inputSampahId || !inputBerat) {
            toast.error("Pilih sampah dan masukkan beratnya dulu!");
            return;
        }
        
        const berat = parseFloat(inputBerat);
        if (berat <= 0) {
            toast.error("Berat harus lebih dari 0!");
            return;
        }

        if (!selectedSampah) return;

        // Masukkan ke keranjang
        const newItem: SampahItem = {
            tempId: Date.now(), // ID unik sementara pakai timestamp
            sampahId: selectedSampah.id,
            namaSampah: selectedSampah.nama_sampah,
            hargaSatuan: selectedSampah.harga_per_satuan,
            berat: berat,
            subtotal: selectedSampah.harga_per_satuan * berat
        };

        setCart([...cart, newItem]);
        
        // Reset form input kecil
        setInputSampahId("");
        setInputBerat("");
        toast.success("Masuk keranjang!");
    };

    const handleRemoveFromCart = (tempId: number) => {
        setCart(cart.filter(item => item.tempId !== tempId));
    };

    const handleSubmitTransaksi = () => {
        if (!selectedNasabahId) {
            toast.error("Pilih nasabah dulu!");
            return;
        }
        if (cart.length === 0) {
            toast.error("Keranjang masih kosong!");
            return;
        }

        // Siapkan data payload sesuai request Server Action
        const payloadItems = cart.map(item => ({
            sampah_id: item.sampahId,
            berat: item.berat
        }));

        startTransition(async () => {
            const result = await createTransaksi(parseInt(selectedNasabahId), payloadItems);
            
            if (result.success) {
                toast.success(result.message);
                // Reset Semua Form
                setCart([]);
                setSelectedNasabahId("");
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <section className='p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-gray-900 shadow-sm'>
            <div className='flex flex-col gap-8'>
                
                {/* HEADER */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <ShoppingCart className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Input Setoran Sampah</h2>
                        <p className="text-sm text-gray-500">Pastikan menimbang dengan jujur ya, jangan korupsi timbangan.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KOLOM KIRI: FORM INPUT */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        
                        {/* 1. Pilih Nasabah */}
                        <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5">
                            <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white font-semibold">
                                <User className="size-5 text-blue-500" />
                                <h3>1. Identitas Penyetor</h3>
                            </div>
                            <Label>Pilih Nasabah</Label>
                            {/* Pakai Select Native HTML dulu biar gampang search-nya (kalau mau canggih pakai library kayak React Select) */}
                            <select 
                                className="w-full p-2.5 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition"
                                value={selectedNasabahId}
                                onChange={(e) => setSelectedNasabahId(e.target.value)}
                            >
                                <option value="">-- Cari Nama Nasabah --</option>
                                {listNasabah.map((n) => (
                                    <option key={n.id} value={n.id}>{n.nama} - {n.alamat}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Input Item */}
                        <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1 text-gray-800 dark:text-white font-semibold">
                                <Calculator className="size-5 text-green-500" />
                                <h3>2. Data Timbangan</h3>
                            </div>

                            <div>
                                <Label>Jenis Sampah</Label>
                                <select 
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition"
                                    value={inputSampahId}
                                    onChange={(e) => setInputSampahId(e.target.value)}
                                >
                                    <option value="">-- Pilih Sampah --</option>
                                    {listSampah.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama_sampah} (Rp {s.harga_per_satuan}/{s.satuan})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Berat ({selectedSampah?.satuan || 'Kg'})</Label>
                                <Input 
                                    type="number" 
                                    placeholder="0.0" 
                                    defaultValue={inputBerat}
                                    onChange={(e) => setInputBerat(e.target.value)}
                                    // step="0.1" // Biar bisa desimal
                                />
                            </div>

                            {/* Preview Harga Sementara */}
                            {selectedSampah && (
                                <div className="p-3 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-sm flex justify-between items-center">
                                    <span>Estimasi:</span>
                                    <span className="font-bold text-lg">Rp {estimasiSubtotal.toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            <button 
                                onClick={handleAddToCart}
                                className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition flex justify-center items-center gap-2"
                            >
                                <Plus className="size-4" /> Tambah ke Daftar
                            </button>
                        </div>
                    </div>

                    {/* KOLOM KANAN: KERANJANG & TOTAL */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 font-semibold text-gray-700 dark:text-gray-200">
                                3. Rincian Setoran
                            </div>
                            
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Sampah</th>
                                            <th className="px-6 py-3 text-center">Berat</th>
                                            <th className="px-6 py-3 text-right">Harga @</th>
                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                            <th className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {cart.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                                                    Belum ada sampah yang ditambahkan.
                                                </td>
                                            </tr>
                                        ) : (
                                            cart.map((item) => (
                                                <tr key={item.tempId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                                                        {item.namaSampah}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.berat}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {item.hargaSatuan.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-primary">
                                                        {item.subtotal.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            onClick={() => handleRemoveFromCart(item.tempId)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                                        >
                                                            <TrashIcon className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* FOOTER TOTAL */}
                            <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <span className="block text-sm text-gray-500">Total Estimasi Pendapatan</span>
                                    <span className="text-3xl font-bold text-primary">Rp {grandTotal.toLocaleString('id-ID')}</span>
                                </div>
                                
                                <button 
                                    onClick={handleSubmitTransaksi}
                                    disabled={isPending || cart.length === 0}
                                    className="main-button px-8 py-3 text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <span className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-5" />
                                            Simpan Transaksi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}