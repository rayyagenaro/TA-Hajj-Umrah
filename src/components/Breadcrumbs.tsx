import Link from "next/link";

export type Crumb = { href?: string; label: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-black dark:text-black">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor" aria-hidden>
                <path d="m9 6 6 6-6 6V6Z" />
              </svg>
            )}
            {it.href ? (
              <Link href={it.href} className="hover:underline underline-offset-4">
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-black dark:text-black">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
