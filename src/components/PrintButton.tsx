"use client";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={`print-hidden inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M7 2h10v6H7V2Zm0 14H4v-3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3h-3v4H7v-4Zm10 0H7v2h10v-2Z" />
      </svg>
      Ekspor PDF
    </button>
  );
}

