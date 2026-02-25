import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundDecor from "@/components/BackgroundDecor";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UmrahYuk | Sistem Pakar Rekomendasi Umrah",
  description: "Demo frontend sistem pakar untuk rekomendasi paket Umrah Reguler, Plus Turki, dan Plus Dubai.",
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
        className={`${plusJakartaSans.variable} min-h-screen antialiased bg-white text-black`}
      >
        <BackgroundDecor />
        <Navbar />
        <main className="pb-20 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}


