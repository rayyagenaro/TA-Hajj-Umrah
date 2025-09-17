import Image from "next/image";

const sparkles = [
  { key: "s1", className: "left-[18%] top-[32%] h-2.5 w-2.5", delay: "0s" },
  { key: "s2", className: "left-[40%] top-[18%] h-3 w-3", delay: "1.4s" },
  { key: "s3", className: "right-[26%] top-[28%] h-2 w-2", delay: "2.2s" },
  { key: "s4", className: "right-[32%] bottom-[38%] h-3 w-3", delay: "0.8s" },
  { key: "s5", className: "left-[28%] bottom-[26%] h-2 w-2", delay: "1.9s" },
];

export default function BackgroundDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* pola bintang */}
      <div className="absolute inset-0 pattern-stars opacity-20 dark:opacity-10" />

      {/* gradasi biru besar */}
      <div className="absolute inset-x-[-20%] top-[-30%] flex justify-center">
        <div className="h-[640px] w-[1100px] rounded-[320px] bg-[conic-gradient(from_140deg_at_50%_40%,rgba(59,130,246,0.20),rgba(37,99,235,0)_55%,rgba(59,130,246,0.22))] blur-3xl opacity-40 dark:opacity-25" />
      </div>

      {/* pilgrims kiri */}
      <div className="absolute left-[-120px] top-[220px] hidden select-none lg:block">
        <Image
          src="/decor/pilgrims.svg"
          alt=""
          width={420}
          height={340}
          sizes="(min-width: 1024px) 420px, 0px"
          className="h-64 w-auto opacity-70 dark:opacity-60"
          draggable={false}
          priority={false}
        />
      </div>

      {/* mosque kanan */}
      <div className="absolute right-[-80px] top-[160px] hidden select-none xl:block">
        <Image
          src="/decor/mosque.svg"
          alt=""
          width={380}
          height={360}
          sizes="(min-width: 1280px) 360px, 0px"
          className="h-72 w-auto opacity-70 dark:opacity-60"
          draggable={false}
          priority={false}
        />
      </div>

      {/* crescent bawah kanan */}
      <div className="absolute right-[12%] bottom-[18%] hidden select-none lg:block">
        <Image
          src="/decor/crescent.svg"
          alt=""
          width={180}
          height={180}
          sizes="(min-width: 1024px) 180px, 0px"
          className="h-36 w-auto opacity-60 dark:opacity-50"
          draggable={false}
          priority={false}
        />
      </div>

      {/* lingkaran putih transparan */}
      <div className="absolute left-[20%] bottom-[22%] hidden h-36 w-36 rounded-full border border-white/40 bg-white/5 blur-[1px] dark:border-white/10 dark:bg-white/5 md:block relative">
        <div className="ornament-ring" />
      </div>

      {/* lingkaran biru transparan */}
      <div className="absolute right-[30%] top-[30%] hidden h-28 w-28 rounded-full border border-primary-200/30 bg-primary-100/20 dark:border-primary-500/20 dark:bg-primary-500/10 md:block" />

      {/* sparkles */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.key}
          className={`star-dot absolute ${sparkle.className}`}
          style={{ animationDelay: sparkle.delay }}
        />
      ))}
    </div>
  );
}
