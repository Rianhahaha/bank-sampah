'use client'
import React, { useEffect, useState, useTransition } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner'

import { AlertCircleIcon, EditIcon, LucideMessageSquareWarning, Plus, TrashIcon, X } from 'lucide-react'
import { Nasabah, Transaksi } from '@/types';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useModal } from '@/hooks/useModal';
import Link from 'next/link';
import DetailTransaksi from './detailTransaksi';

// import { createNasabah, updateNasabah, deleteNasabah } from './action';


export default function TransaksiPage({ data }: { data: Transaksi[] }) {

    const { isOpen, openModal, closeModal } = useModal();
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
    const [searchTerm, setSearchTerm] = useState("");
    const [displayData, setDisplayData] = useState<Transaksi[]>(data);
    const [selectedNasabah, setSelectedNasabah] = useState<Transaksi | null>(null);
    const [selectDeletedNasabah, setDeletedNasabah] = useState<Transaksi | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setDisplayData(data);
    }, [data]);

    // Fungsi untuk handle klik edit
    const handleSelect = (transaksi: Transaksi) => {
        setSelectedNasabah(transaksi.id ? transaksi : null);
        openModal();
    };

    // Fungsi untuk handle klik tambah (reset state ke null/empty)
    // const handleAdd = () => {
    //     setSelectedNasabah(null);
    //     openModal();
    // };

    // const handleDeleteModal = (nasabah: Nasabah) => {
    //     setDeletedNasabah(nasabah);
    //     openDeleteModal();
    // }





    const handleFilter = () => {
        // Kalau kosong, balikin ke data asli
        if (!searchTerm.trim()) {
            setDisplayData(data);
            return;
        }

        // Lakukan filter dari data asli (props 'data')
        const filtered = data.filter((transaksi) =>
            transaksi.nasabah.nama?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Update data yang tampil di tabel
        setDisplayData(filtered);
        console.log("Hasil Filter:", filtered);
    }
    const handleFilterReset = () => {
        setSearchTerm("");
        setDisplayData(data);

    }



    const handleSave = () => {
        // Handle save logic here
        console.log("Saving changes...");
        closeModal();
    }

    return (
        <>
            <section className='p-5 rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3'>
                <div className='flex flex-col gap-5 pb-5'>
                    <h2
                        className="text-xl font-semibold text-gray-800 dark:text-white/90"
                        x-text="pageName"
                    >
                        Daftar Transaksi
                    </h2>

                    <div className="relative flex justify-between">
                        <div className='flex items-stretch'>
                            <div className='size-full relative'>
                                {searchTerm && (

                                    <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 cursor-pointer z-30' onClick={handleFilterReset}>

                                        <X className='size-4 ' />
                                    </button>
                                )}
                                <input
                                    //   ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    placeholder="Cari Nasabah..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="relative dark:bg-dark-900 size-full rounded-l-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-7.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                            <button
                                className="main-button rounded-l-none!"
                                onClick={handleFilter}
                            >
                                <svg
                                    className="fill-current"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                        fill=""
                                    />
                                </svg>
                            </button>
                        </div>
                        <button
                            className="main-button flex "

                        >
                            <Link href="/admin/transaksi/tambah">
                                Tambah Transaksi
                            </Link>
                            <Plus className='size-4' />
                        </button>
                    </div>
                </div>
                {displayData?.length === 0 ? (
                    <div className="text-center py-10">Data tidak Ditemukan</div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <div className="min-w-275.5">
                                    <Table>
                                        {/* Table Header */}
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                            <tr>
                                                <TableCell
                                                    isHeader
                                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                                >
                                                    No
                                                </TableCell>
                                                <TableCell
                                                    isHeader
                                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                                >
                                                    Nama Nasabah
                                                </TableCell>
                                                <TableCell
                                                    isHeader
                                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                                >
                                                    Tanggal Transaksi
                                                </TableCell>
                                                <TableCell
                                                    isHeader
                                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                                >
                                                    Saldo Nasabah
                                                </TableCell>

                                                <TableCell
                                                    isHeader
                                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                                >
                                                    Aksi
                                                </TableCell>
                                            </tr>
                                        </TableHeader>

                                        {/* Table Body */}

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                            {displayData?.map((order, index) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        {order?.nasabah?.nama}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        Rp {order.total_harga.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start flex gap-3 flex-wrap">
                                                        <button
                                                            className='main-button rounded-full! p-3!'
                                                            onClick={() => handleSelect(order)}
                                                        >
                                                            <EditIcon className='size-5' />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>

                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                    </>
                )
                }
                {/* Modal Detail */}
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4">
                    <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
                        <div className="flex px-6 py-3 bg-primary text-white justify-between items-center w-full border-gray-200 dark:border-white/5">
                            <div className="text-xl font-semibold ">
                                {selectedNasabah ? 'Edit Nasabah' : 'Tambah Nasabah'}
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex size-10 text-white hover:text-white/50 border-2 border-transparent hover:border-white global-transition  items-center justify-center rounded-full"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                                        fill="currentColor"
                                    />
                                </svg>
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




            </section>

        </>
    )
}
