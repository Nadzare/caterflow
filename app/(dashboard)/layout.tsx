'use client'

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/?auth=login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF6F0] dark:bg-[#12100E] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 animate-bounce-slow">
            <Image
              src="/caterflowlogo.png"
              alt="CaterFlow Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-sm" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-stone-500">
              Loading CaterFlow
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
