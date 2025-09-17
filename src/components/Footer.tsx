export default function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 dark:border-white/10 print-hidden">
      <div className="container-section py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-black dark:text-black">
            © {new Date().getFullYear()} HajiExpert. Semua hak dilindungi.
          </p>
          <div className="text-sm text-black dark:text-black">
            Dibangun dengan Next.js & Tailwind CSS.
          </div>
        </div>
      </div>
    </footer>
  );
}
