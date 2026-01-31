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
import Image from 'next/image';
import { AlertCircleIcon, EditIcon, ImagePlus, LucideMessageSquareWarning, Plus, TrashIcon, X } from 'lucide-react'

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useModal } from '@/hooks/useModal';
import { createSampah, updateSampah, deleteSampah } from './action';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';

interface Sampah {
    id: number;
    nama_sampah: string;
    foto_sampah: string;
    rt: string;
    harga_per_satuan: number;
    satuan: string;
    created_at: string;
}

export default function SampahPage({ data }: { data: Sampah[] }) {

    const { isOpen, openModal, closeModal } = useModal();
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
    const [searchTerm, setSearchTerm] = useState("");
    const [displayData, setDisplayData] = useState<Sampah[]>(data);
    const [selectedNasabah, setSelectedNasabah] = useState<Sampah | null>(null);
    const [selectDeletedNasabah, setDeletedNasabah] = useState<Sampah | null>(null);
    const [isPending, startTransition] = useTransition();

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [selectedSatuan, setSelectedSatuan] = useState<string>("kg");

    useEffect(() => {
        setDisplayData(data);
    }, [data]);

    // Fungsi untuk handle klik edit
    const handleEdit = (sampah: Sampah) => {
        setSelectedNasabah(sampah);
        openModal();
    };

    // Fungsi untuk handle klik tambah (reset state ke null/empty)
    const handleAdd = () => {
        setSelectedNasabah(null);
        openModal();
    };

    const handleDeleteModal = (sampah: Sampah) => {
        setDeletedNasabah(sampah);
        openDeleteModal();
    }


    const handleDelete = () => {
        startTransition(async () => {
            if (!selectDeletedNasabah) return;
            const result = await deleteSampah(selectDeletedNasabah.id);

            if (result.success) {
                const sampah = selectDeletedNasabah?.nama_sampah

                toast.error(`Sampah ${sampah} berhasil dihapus!`);
                closeDeleteModal();
            } else {
                toast.error(result.message);
            }
        });
    };


    const handleFilter = () => {
        // Kalau kosong, balikin ke data asli
        if (!searchTerm.trim()) {
            setDisplayData(data);
            return;
        }

        // Lakukan filter dari data asli (props 'data')
        const filtered = data.filter((sampah) =>
            sampah.nama_sampah.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Update data yang tampil di tabel
        setDisplayData(filtered);
    }
    const handleFilterReset = () => {
        setSearchTerm("");
        setDisplayData(data);
    }
    const clientAction = async (formData: FormData) => {
        startTransition(async () => {
            // Jalankan action dan tangkap return-nya
            const result = selectedNasabah
                ? await updateSampah(formData, selectedNasabah.id)
                : await createSampah(formData);

            // Sekarang kita bisa pakai return-nya buat Toast
            if (result.success) {
                const sampah = selectedNasabah?.nama_sampah
                toast.success(
                    selectedNasabah
                        ? `Sampah ${sampah} berhasil diperbarui!`
                        : `Sampah ${sampah} berhasil ditambahkan!`
                );
                closeModal();

            } else {
                // Kalau gagal, modal jangan ditutup, biar user bisa benerin isiannya
                toast.error(result.message);
            }
        });
    };

    // Image handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Buat URL sementara dari file local biar bisa tampil
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    // Update Preview saat Modal dibuka (Reset atau Isi data lama)
    useEffect(() => {
        if (isOpen) {
            if (selectedNasabah?.foto_sampah) {
                setImagePreview(selectedNasabah.foto_sampah);
                setSelectedSatuan(selectedNasabah.satuan);
            } else {
                setImagePreview(null);
                setSelectedSatuan("kg");
            }
        } else {
            // Bersihkan preview saat modal tutup biar gak ada 'hantu' gambar sebelumnya
            setImagePreview(null);
        }
    }, [isOpen, selectedNasabah]);

      const satuanOption = [
    { value: "kg", label: "Kg" },
    { value: "gram", label: "Gram" },
    { value: "lt", label: "Liter" },
  ];

    const handleSelectChange = (value: string) => {
    setSelectedSatuan(value);

  };

    return (
        <>
            <section className='p-5 rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3'>
                <div className='flex flex-col gap-5 pb-5'>
                    <h2
                        className="text-xl font-semibold text-gray-800 dark:text-white/90"
                        x-text="pageName"
                    >
                        Daftar Sampah
                    </h2>

                    <div className="relative flex justify-between flex-col sm:flex-row gap-3">
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
                                    placeholder="Cari Sampah..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="relative dark:bg-dark-900 size-full rounded-l-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-7.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                            <button
                                className="main-button rounded-l-none! py-0!"
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
                            onClick={handleAdd}
                        >
                            Tambah Sampah
                            <Plus className='size-4' />
                        </button>
                    </div>
                </div>
                {displayData?.length === 0 ? (
                    <div className="text-center py-10">Data tidak Ditemukan</div>
                ) : (
                    <>
                        <div className=" bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="">
                                <div className="w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {displayData?.map((order) => (
                                            <>
                                                <div key={order.id} className="w-full h-[10rem] flex shadow-xl border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden ">
                                                    <Image src={order.foto_sampah} alt={order.nama_sampah} width={300} height={300} className="rounded-md rounded-r-none max-w-[10rem] h-full object-cover" />
                                                    <div className="w-full p-2 px-5 flex flex-col justify-between">
                                                        <div>
                                                            <h2
                                                                className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                                                {order.nama_sampah}
                                                            </h2>
                                                            <h2
                                                                className="text-xl font-bold text-primary">
                                                                Rp.{order.harga_per_satuan} / {order.satuan}
                                                            </h2>
                                                            <p className="text-xs text-gray-500 dark:text-white/50">Dibuat Pada : {new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className='w-full flex justify-end gap-2'>
                                                            <button
                                                                className='main-button py-1!'
                                                                onClick={() => handleEdit(order)}
                                                            >
                                                                <EditIcon className='size-5' />
                                                            </button>
                                                            <button
                                                                className='main-button-danger py-1!'
                                                                onClick={() => handleDeleteModal(order)}
                                                            >

                                                                <TrashIcon className='size-5' />
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </>
                                        ))}
                                    </div>


                                </div>
                            </div>
                        </div>

                    </>
                )
                }
                {/* Modal Delete */}
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} className="max-w-175 m-4">
                    <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
                        <div className="flex px-6 py-3 bg-primary text-white justify-between items-center w-full border-gray-200 dark:border-white/5">
                            <div className="text-xl font-semibold ">
                                {selectedNasabah ? 'Edit Sampah' : 'Tambah Sampah'}
                            </div>
                            <button
                                onClick={closeDeleteModal}
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
                            <div className="text-center text-lg">
                                <AlertCircleIcon className='size-10 mx-auto text-red-500 mb-3' />
                                Apakah Anda yakin ingin menghapus <br></br><strong>{selectDeletedNasabah?.nama_sampah}?</strong>

                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                                <button className="main-button-danger flex" disabled={isPending} onClick={handleDelete}>
                                    {isPending ? (
                                        <>
                                            <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Hapus Sampah
                                            <TrashIcon className='size-4' />
                                        </>
                                    )}

                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* Modal Edit */}
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4">
                    <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
                        <div className="flex px-6 py-3 bg-primary text-white justify-between items-center w-full border-gray-200 dark:border-white/5">
                            <div className="text-xl font-semibold ">
                                {selectedNasabah ? 'Edit Sampah' : 'Tambah Sampah'}
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

                        <form action={clientAction} className="px-6 py-3 flex flex-col">
                            <div className="flex gap-5">
                                {/* ID Hidden jika sedang edit */}
                                {selectedNasabah && <input type="hidden" name="id" value={selectedNasabah.id} />}
                                <div className='w-1/2 h-full'>
                                    <Label>Foto Sampah</Label>
                                    <label
                                        htmlFor="dropzone-file"
                                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors relative overflow-hidden ${imagePreview ? 'border-primary/50' : 'border-gray-300'}`}
                                    >
                                        {imagePreview ? (
                                            // TAMPILAN JIKA ADA PREVIEW
                                            <>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="absolute inset-0 w-full h-full object-cover p-2 rounded-2xl"
                                                />
                                                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-medium flex items-center gap-2">
                                                        <ImagePlus className="size-24" />
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            // TAMPILAN JIKA KOSONG
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                                                <ImagePlus className="size-24 text-primary" />
                                            </div>
                                        )}

                                        {/* INPUT ASLINYA DISEMBUYIKAN */}
                                        <input
                                            id="dropzone-file"
                                            type="file"
                                            name="foto_sampah"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <div className="flex flex-col w-1/2 gap-4">
                                    <div>
                                        <Label>Nama</Label>
                                        <Input
                                            type="text"
                                            name="nama_sampah"
                                            defaultValue={selectedNasabah?.nama_sampah || ''}
                                            placeholder='Nama Sampah...'
                                        />
                                    </div>
                                    <div>
                                        <Label>Harga</Label>
                                        <Input
                                            type="text"
                                            name="harga_per_satuan"
                                            defaultValue={selectedNasabah?.harga_per_satuan || ''}
                                            placeholder='Harga Sampah...'
                                        />
                                    </div>
                                    <div>
                                        <Label>Satuan</Label>
                                        <Input
                                            type="hidden"
                                            name="satuan"
                                            defaultValue={selectedSatuan || ''}
                                        />
                                        <div>
                                            <div className="relative">
                                                <Select
                                                    options={satuanOption}
                                                    placeholder="Pilih Satuan"
                                                    onChange={handleSelectChange}
                                                    className="dark:bg-dark-900"
                                                    defaultValue={selectedSatuan}

                                                />
                                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                    <ChevronDownIcon />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <button className="main-button flex" type='submit' disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            {selectedNasabah ? 'Simpan Perubahan' : 'Tambah Sampah'}
                                            {selectedNasabah ? <EditIcon className='size-4' /> : <Plus className='size-4' />}
                                        </>
                                    )}

                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

            </section>

        </>
    )
}
