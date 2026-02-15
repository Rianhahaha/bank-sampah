'use client' // 1. Wajib tambahkan ini agar hook jalan

import { LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function Page() {
    // State untuk melacak section mana yang sedang aktif
    const [activeSection, setActiveSection] = useState('home');
    const [isScrolled, setIsScrolled] = useState(false);

    // 2. Logic untuk Smooth Scroll manual
    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
        e.preventDefault(); // Mencegah loncat kasar default browser
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 3. Logic Intersection Observer untuk Active State otomatis
    useEffect(() => {
        const sections = document.querySelectorAll('div[id]'); // Ambil semua div yang punya ID

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.5, // Section dianggap aktif jika 50% terlihat di layar
            }
        );
        sections.forEach((section) => observer.observe(section));

        const handleScroll = () => {
            // Kalau scroll lebih dari 50px, anggap "scrolled"
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);


        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Helper class untuk styling menu aktif
    const getLinkClass = (id: string) => {
        const baseClass = "global-transition cursor-pointer ";
        // Jika active, warnanya putih terang & bold, jika tidak putih transparan
        return baseClass + (activeSection === id ? "text-white font-bold scale-105" : "text-white/50 hover:text-white");
    };

    return (
        <section>
            <header
                className={`fixed top-0 w-full z-[9999] transition-all duration-300 ${isScrolled
                    ? "bg-black/30 backdrop-blur-md shadow-lg"
                    : "bg-transparent h-[8rem]"
                    }`}
            >                <div className={`w-full flex justify-between global-transition px-5 md:px-10 lg:px-20 ${isScrolled ? 'py-5' : 'py-10'}`}>
                    <Image className='w-30 md:w-40 lg:w-50' alt='logo' width={300} height={300} src='/images/logo/logo.svg' />

                    <div className=' justify-center items-center gap-10 hidden md:flex'>
                        {/* 4. Ganti Link biasa dengan onClick handler */}
                        <Link
                            href="#home"
                            onClick={(e) => handleScrollTo(e, 'home')}
                            className={getLinkClass('home')}
                        >
                            Home
                        </Link>
                        <Link
                            href="#tentang"
                            onClick={(e) => handleScrollTo(e, 'tentang')}
                            className={getLinkClass('tentang')}
                        >
                            Tentang Kami
                        </Link>
                        <Link
                            href="#lokasi"
                            onClick={(e) => handleScrollTo(e, 'lokasi')}
                            className={getLinkClass('lokasi')}
                        >
                            Lokasi
                        </Link>
                    </div>

                    <div className='w-30 md:w-40 lg:w-50 flex justify-end'>
                        <Link href='/login' className='main-button'>
                            Masuk
                            <LogIn />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Container Utama */}
            <div className='w-full main-gradient relative'>
                {/* Background Shape Putih */}
                <div className="hidden md:block absolute right-0 top-0 w-[20dvw]  h-[150dvh] bg-white rounded-bl-[10dvw] z-10 pointer-events-none"></div>

                {/* SECTION HOME */}
                <div className='min-h-screen w-full flex  items-center px-5 md:px-10 lg:px-20 pt-[8rem] relative z-20 flex-wrap-reverse' id='home'>
                    <div className="flex flex-col w-full md:w-1/2">
                        <div className='font-bold text-white text-center md:text-left'>
                            <h2 className="md:text-[25px] lg:text-[30px] mb-3">Selamat Datang</h2>
                            <h2 className="text-[25px] md:text-[50px] lg:text-[65px] md:leading-[60px]">
                                BANK SAMPAH<br />PADUKUHAN NGLENGIS
                            </h2>
                            <p className='font-normal text-[18px] my-5'>
                                Ubah barang tidak terpakai menjadi sesuatu yang lebih berharga
                            </p>
                            <button className='main-button-white mt-5'>Lebih Lanjut</button>
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/2">
                        <Image className='w-full' alt='hero' width={500} height={500} src='/images/hero.png' />
                    </div>
                </div>

                {/* SECTION TENTANG */}
                <div className="min-h-screen flex items-center  px-5 md:px-10 lg:px-20 relative z-20" id='tentang'>

                    <Image className='absolute w-[10vw] z-30 right-[4vw] top-[20vh]' alt='logo' width={300} height={300} src='/images/logo/logo_green.svg' />

                    <div className="flex flex-col text-center md:text-left md:w-[60%]">
                        <div className='font-bold text-white'>
                            <h2 className="text-[25px] md:text-[50px] lg:text-[65px] md:leading-[60px] mb-5">Tentang Kami</h2>
                            <p className='font-normal text-[18px] text-justify'>
                                Bank sampah adalah fasilitas atau tempat pengumpulan sampah yang dipilah dan memiliki sistem pengelolaan seperti perbankan, namun yang ditabung adalah sampah, bukan uang. Nasabah bank sampah menyetorkan sampah yang memiliki nilai ekonomis, dan pengelolaan ini bertujuan untuk mengurangi volume sampah, mendaur ulang, serta meningkatkan kesadaran masyarakat akan pentingnya pengelolaan sampah.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION LOKASI */}
            <div className="min-h-screen py-20 flex flex-col justify-center items-center bg-white px-5" id='lokasi'>
                <h2 className="text-[25px] md:text-[50px] lg:text-[65px] md:leading-[60px] mb-5 text-gray-800 font-bold text-center">
                    Lokasi Kami
                </h2>
                <div className='w-full h-[20rem] md:h-full md:w-fit flex justify-center border border-slate-400 overflow-hidden rounded-2xl shadow-xl '>
                    {/* Perbaikan URL Google Maps, gunakan embed link yang benar */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.9!2d110.4!3d-7.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExMMKwMjQnMDAuMCJF!5e0!3m2!1sen!2sid!4v1600000000000!5m2!1sen!2sid"
                        width="800"
                        height="600"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <h2 className="text-[18px] leading-[30px] my-5 text-gray-800 font-bold text-center max-w-2xl">
                    Nglengis, Asem Ngecis, Sitimulyo, Kabupaten Bantul, Daerah Istimewa Yogyakarta
                </h2>
                <Link href='/login' className='main-button'>
                    Masuk
                    <LogIn />
                </Link>
            </div>
            <footer className="w-full py-6 main-gradient text-center">
                <p className="text-white text-sm font-light">
                    &copy; {new Date().getFullYear()} Bank Sampah Padukuhan Nglengis. All rights reserved.
                </p>
                {/* <p className="text-gray-600 text-xs mt-1">
                    Dibuat dengan <span className="text-red-500">❤</span> untuk lingkungan yang lebih bersih.
                </p> */}
            </footer>
        </section>
    )
}