import Link from "next/link";
import { IconWallet, IconDiamond, IconPlane } from "@/components/Icons";

type Variant = "reguler" | "plus" | "furoda";

export default function PackageCard({
  title,
  priceRange,
  waitTime,
  highlights,
  href,
  variant,
}: {
  title: string;
  priceRange: string;
  waitTime: string;
  highlights: string[];
  href: string;
  variant: Variant;
}) {
  const badgeColor = {
    reguler: "bg-blue-50 text-blue-700 ring-blue-100",
    plus: "bg-sky-50 text-sky-700 ring-sky-100",
    furoda: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  }[variant];

  const intensity = {
    reguler: "from-primary-100 to-white",
    plus: "from-primary-200 to-white",
    furoda: "from-primary-300 to-white",
  }[variant];

  const Icon = {
    reguler: IconWallet,
    plus: IconDiamond,
    furoda: IconPlane,
  }[variant];

  return (
    <div
      className={`group relative rounded-2xl border border-black/5 bg-gradient-to-b ${intensity} p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600/10 text-primary-700">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeColor}`}>
          {variant.toUpperCase()}
        </span>
      </div>
      <p className="mt-2 text-sm text-black dark:text-black">{waitTime}</p>
      <p className="mt-1 text-sm font-semibold text-primary-700">{priceRange}</p>

      <ul className="mt-4 space-y-2 text-sm text-black dark:text-black">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-primary-600 transition-colors group-hover:text-primary-700" fill="currentColor">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={href}
          className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-primary-700"
        >
          Lihat Detail
        </Link>
        <Link href="/rekomendasi" className="text-sm font-medium text-primary-700 underline-offset-4 hover:underline">
          Bandingkan
        </Link>
      </div>
    </div>
  );
}
