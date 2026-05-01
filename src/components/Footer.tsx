export default function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 print-hidden">
      <div className="container-section py-10">
        <div className="flex flex-col items-center justify-between gap-6 text-black md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-black">© {new Date().getFullYear()} UmrahYuk. Semua hak dilindungi.</p>
            <p className="mt-1 text-sm text-black">Bantuan cepat untuk konsultasi paket dan rekomendasi.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:justify-end">
            <a
              href="https://wa.me/6282231065750"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/rayyagenaro"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 font-medium text-primary-700 transition hover:bg-primary-100"
            >
              Instagram
            </a>
            <a
              href="mailto:gennarorayya05@gmail.com"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
