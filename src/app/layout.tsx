import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundDecor from "@/components/BackgroundDecor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Pakar Haji | Rekomendasi Paket",
  description:
    "Frontend sistem pakar untuk rekomendasi paket Haji: Reguler, Plus, dan Furoda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-white text-black dark:bg-slate-900 dark:text-white`}
      >
        <BackgroundDecor />
        <Navbar />
        <main className="pb-20 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
