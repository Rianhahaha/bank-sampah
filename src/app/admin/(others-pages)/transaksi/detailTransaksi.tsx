'use client';
import { getDetailTransaksi } from "@/data/transaksi";
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DetailTransaksi } from "@/types";
import { Edit } from "lucide-react";
import Link from "next/link";
export default function DetailTransaksiModal({ id, total_harga }: { id: number, total_harga: number }) {
    const [data, setData] = useState<DetailTransaksi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDetailTransaksi(id);
                setData(result);
                setLoading(false);
            }
            catch (error) {
                console.error("Error fetching detail transaksi:", error);
            }
        };
        if (id) {
            fetchData();

        }
    }, [id]);

    if (loading) {
        return (
            <div>Memuat...</div>
        )
    }


    return (
        <>
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
                            Nama Sampah
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Jumlah
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Harga Per Satuan
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Subtotal
                        </TableCell>
                    </tr>
                </TableHeader>

                {/* Table Body */}

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.map((order, index) => (
                        <TableRow key={order.id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                {index + 1}
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                {order.sampah.nama_sampah}
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                {order.berat} {order.sampah.satuan}
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                Rp. {order.sampah.harga_per_satuan.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                Rp. {order.subtotal.toLocaleString('id-ID')}
                            </TableCell>
                        </TableRow>

                    ))}
                </TableBody>
            </Table>
            <hr className="py-2" />
            <div className="flex justify-between items-end gap-5 flex-wrap">
                <div className="text-center py-3 px-5 border border-primary rounded-lg text-primary bg-primary/10 w-fit">
                    Total Harga : Rp. {total_harga.toLocaleString('id-ID')}
                </div>

                <Link href={`/admin/transaksi/edit/${id}`} className="main-button">
                    <Edit />
                    Edit Transaksi
                </Link>

            </div>



        </>
    )
}
