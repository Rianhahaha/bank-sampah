'use client'
import React, { useEffect, useState, useTransition } from 'react'
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner'
import { AlertCircleIcon, Edit, Plus, Trash, View, X, AlertTriangle } from 'lucide-react'
import { Transaksi } from '@/types';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Link from 'next/link';
import DetailTransaksi from './detailTransaksi';

// IMPORT FUNGSI DELETE DARI ACTION
import { deleteTransaksi } from './action'; 

export default function TransaksiPage({ data }: { data: Transaksi[] }) {

    const { isOpen, openModal, closeModal } = useModal();
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [displayData, setDisplayData] = useState<Transaksi[]>(data);
    const [selectedNasabah, setSelectedNasabah] = useState<Transaksi | null>(null);
    
    // STATE UNTUK HAPUS
    const [selectedDeletedTransaksi, setSelectedDeletedTransaksi] = useState<Transaksi | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setDisplayData(data);
    }, [data]);

    // Handle klik icon Detail (View)
    const handleSelect = (transaksi: Transaksi) => {
        setSelectedNasabah(transaksi);
        openModal();
    };

    // Handle klik icon Trash (Hapus)
    const handleDeleteModal = (transaksi: Transaksi) => {
        setSelectedDeletedTransaksi(transaksi);
        openDeleteModal();
    }

    // Eksekusi fungsi Hapus ke Server
    const confirmDelete = () => {
        if (!selectedDeletedTransaksi) return;

        startTransition(async () => {
            // Asumsi id nasabah ada di selectedDeletedTransaksi.nasabah_id atau dari object nasabah
            const nasabahId = selectedDeletedTransaksi.id;
            console.log("Attempting to delete transaksi with ID:", selectedDeletedTransaksi.id, "for nasabah ID:", nasabahId);

            const result = await deleteTransaksi(
                selectedDeletedTransaksi.id,
                nasabahId,
                selectedDeletedTransaksi.total_harga
            );

            if (result.success) {
                toast.success(result.message);
                closeDeleteModal();
            } else {
                toast.error(result.message);
            }
        });
    }

    const handleFilter = () => {
        if (!searchTerm.trim()) {
            setDisplayData(data);
            return;
        }
        const filtered = data.filter((transaksi) =>
            transaksi.nasabah.nama?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayData(filtered);
    }

    const handleFilterReset = () => {
        setSearchTerm("");
        setDisplayData(data);
    }

    return (
        <>
            <section className='p-5 rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3'>
                {/* ... (BAGIAN HEADER & SEARCH SAMA SEPERTI SEBELUMNYA) ... */}
                <div className='flex flex-col gap-5 pb-5'>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Daftar Transaksi</h2>

                    <div className="relative flex justify-between gap-2">
                        <div className='flex items-stretch'>
                            <div className='size-full relative'>
                                {searchTerm && (
                                    <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 cursor-pointer z-30' onClick={handleFilterReset}>
                                        <X className='size-4 ' />
                                    </button>
                                )}
                                <input
                                    type="text"
                                    value={searchTerm}
                                    placeholder="Cari Nasabah..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="relative dark:bg-dark-900 size-full rounded-l-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-7.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                            <button className="main-button rounded-l-none!" onClick={handleFilter}>
                                 <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                     <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="" />
                                 </svg>
                            </button>
                        </div>
                        <Link href="/admin/transaksi/tambah" className="main-button flex">
                             <span className='hidden md:block'>Tambah Transaksi</span>
                             <Plus className='size-4' />
                        </Link>
                    </div>
                </div>

                {displayData?.length === 0 ? (
                    <div className="text-center py-10">Data tidak Ditemukan</div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-275.5">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <tr>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">No</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Nama Nasabah</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Tanggal Transaksi</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Total Harga</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Aksi</TableCell>
                                        </tr>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {displayData?.map((order, index) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="px-5 py-4 text-start">{index + 1}</TableCell>
                                                <TableCell className="px-5 py-4 text-start">{order?.nasabah?.nama}</TableCell>
                                                <TableCell className="px-5 py-4 text-start">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="px-5 py-4 text-start font-medium text-primary">Rp {order.total_harga.toLocaleString('id-ID')}</TableCell>
                                                
                                                <TableCell className="px-5 py-4 text-start flex gap-3 flex-wrap">
                                                    {/* TOMBOL VIEW */}
                                                    <button
                                                        className='main-button rounded-full! p-3!'
                                                        onClick={() => handleSelect(order)}
                                                        title="Lihat Detail"
                                                    >
                                                        <View className='size-5' />
                                                    </button>
                                                    
                                                    {/* TOMBOL HAPUS */}
                                                    <button
                                                        className='main-button-danger rounded-full! p-3!'
                                                        onClick={() => handleDeleteModal(order)}
                                                        title="Hapus Transaksi"
                                                    >
                                                        <Trash className='size-5' />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL VIEW DETAIL TRANSAKSI */}
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4">
                     <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
                        <div className="flex px-6 py-3 bg-primary text-white justify-between items-center w-full">
                            <div className="text-xl font-semibold">Detail Transaksi</div>
                            <button onClick={closeModal} className="flex size-10 text-white hover:text-white/50 items-center justify-center rounded-full">
                                <X className="size-6"/>
                            </button>
                        </div>
                        <div className="px-6 py-3 flex flex-col">
                            {selectedNasabah ? (
                                <DetailTransaksi id={selectedNasabah.id} total_harga={selectedNasabah.total_harga} />
                            ) : (
                                <div className="flex items-center justify-center h-40">
                                    <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></span>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>

                {/* MODAL KONFIRMASI HAPUS TRANSAKSI */}
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} className="max-w-[400px] m-4">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl flex flex-col items-center text-center">
                        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                            <AlertTriangle className="size-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hapus Transaksi?</h3>
                        <p className="text-gray-500 mb-6">
                            Apakah Anda yakin ingin menghapus transaksi milik <span className="font-semibold text-gray-800 dark:text-gray-300">{selectedDeletedTransaksi?.nasabah?.nama}</span>? 
                            <br/><br/>
                            <span className="text-sm text-red-500 font-medium">Saldo nasabah sebesar Rp {selectedDeletedTransaksi?.total_harga?.toLocaleString('id-ID')} akan otomatis ditarik (dikurangi).</span>
                        </p>

                        <div className="flex w-full gap-3">
                            <button 
                                onClick={closeDeleteModal} 
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                                disabled={isPending}
                            >
                                Batal
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Menghapus...
                                    </>
                                ) : (
                                    "Ya, Hapus"
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>

            </section>
        </>
    )
}