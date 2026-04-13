import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundDecor from "@/components/BackgroundDecor";

const poppins = Poppins({
  display: "swap",
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        className={`${poppins.className} ${poppins.variable} min-h-screen antialiased bg-white text-black`}
      >
        <BackgroundDecor />
        <div className="relative z-10">
          <Navbar />
          <main className="pb-20 pt-24">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
