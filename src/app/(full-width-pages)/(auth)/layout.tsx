import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white z-1 dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 ">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-50 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              {/* <GridShape /> */}
              <div className="flex flex-col items-center max-w-xs text-gray-800">
                
                <p className="text-center font-bold">
                  Masuk Sebagai
                </p>
                <p className="text-center text-[50px] font-bold">
                  Admin
                </p>
                  <Image
                    width={231}
                    height={48}
                    src="./images/admin.svg"
                    alt="Logo"
                    className="w-full"
                  />
              </div>
            </div>
          </div>
          {/* <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div> */}
        </div>
      </ThemeProvider>
    </div>
  );
}
