import Link from "next/link";
import type { SVGProps } from "react";
import { IconWallet, IconDiamond, IconPlane, IconKaaba } from "@/components/Icons";

export type PackageCardVariant = "hemat" | "reguler" | "vip" | "turki" | "dubai" | "mesir";

type PackageIcon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

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
  variant: PackageCardVariant;
}) {
  const badgeColor = {
    hemat: "bg-sky-50 text-sky-700 ring-sky-100",
    reguler: "bg-blue-50 text-blue-700 ring-blue-100",
    vip: "bg-rose-50 text-rose-700 ring-rose-100",
    turki: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dubai: "bg-amber-50 text-amber-700 ring-amber-100",
    mesir: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  } satisfies Record<PackageCardVariant, string>;

  const intensity = {
    hemat: "from-sky-100 to-white",
    reguler: "from-primary-100 to-white",
    vip: "from-rose-100 to-white",
    turki: "from-emerald-100 to-white",
    dubai: "from-amber-100 to-white",
    mesir: "from-cyan-100 to-white",
  } satisfies Record<PackageCardVariant, string>;

  const badgeLabel = {
    hemat: "HEMAT",
    reguler: "REGULER",
    vip: "VIP GOLD",
    turki: "PLUS TURKI",
    dubai: "PLUS DUBAI",
    mesir: "PLUS MESIR",
  } satisfies Record<PackageCardVariant, string>;

  const icons = {
    hemat: IconWallet,
    reguler: IconWallet,
    vip: IconKaaba,
    turki: IconDiamond,
    dubai: IconPlane,
    mesir: IconPlane,
  } satisfies Record<PackageCardVariant, PackageIcon>;
  const Icon = icons[variant];

  return (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border border-black/5 bg-gradient-to-b ${intensity[variant]} p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600/10 text-primary-700">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide ring-1 ${badgeColor[variant]}`}
        >
          {badgeLabel[variant]}
        </span>
      </div>
      <p className="mt-2 text-sm text-black">{waitTime}</p>
      <p className="mt-1 text-sm font-semibold text-primary-700">{priceRange}</p>

      <ul className="mt-4 flex-1 space-y-2 text-sm text-black">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-primary-600 transition-colors group-hover:text-primary-700" fill="currentColor">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-primary-700"
        >
          Lihat Detail Paket
        </Link>
      </div>
    </div>
  );
}
