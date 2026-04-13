export default function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(14,165,233,0.08),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.62)_0%,rgba(245,248,255,0.84)_46%,rgba(236,242,255,0.94)_100%)]" />

      <div className="absolute left-1/2 top-0 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-300/40 to-transparent" />
      <div className="absolute bottom-[-100px] left-1/2 h-[210px] w-[520px] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.10),rgba(59,130,246,0.00)_72%)] blur-xl" />

      <div className="absolute inset-0 opacity-45 md:opacity-35">
        <div className="absolute left-[6%] top-[14%] h-28 w-28 rounded-[28px] border border-primary-200/35 bg-white/35" />
        <div className="absolute right-[8%] top-[18%] h-24 w-24 rounded-full border border-cyan-200/35 bg-cyan-50/35" />
        <div className="absolute left-[11%] bottom-[16%] h-20 w-20 rounded-full border border-slate-200/40 bg-white/30" />
        <div className="absolute right-[12%] bottom-[14%] h-24 w-24 rounded-[24px] border border-emerald-200/35 bg-emerald-50/35" />
      </div>

      <div className="absolute inset-0 hidden md:block motion-reduce:hidden">
        <div className="absolute inset-0 opacity-[0.16] [mask-image:radial-gradient(ellipse_78%_54%_at_50%_40%,black_22%,transparent_82%)]">
          <div className="h-full w-full bg-[linear-gradient(rgba(30,64,175,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.10)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>

        <div className="absolute left-[18%] top-[30%] h-px w-[280px] -rotate-[11deg] bg-gradient-to-r from-transparent via-primary-300/40 to-transparent" />
        <div className="absolute right-[18%] top-[54%] h-px w-[250px] rotate-[9deg] bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

        <div className="absolute left-[44%] top-[30%] h-28 w-28 animate-pulse-soft rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,0.75),rgba(125,211,252,0.35)_36%,rgba(37,99,235,0.12)_62%,rgba(37,99,235,0)_80%)]" />

        <div className="absolute right-[18%] top-[24%] hidden h-48 w-48 lg:block">
          <div className="absolute inset-0 animate-[spin_36s_linear_infinite] rounded-full border border-primary-200/40 [mask-image:conic-gradient(from_0deg,transparent_0deg,black_72deg,black_280deg,transparent_360deg)]" />
        </div>

        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_84%_58%_at_50%_46%,black_16%,transparent_82%)]">
          <div className="absolute left-[7%] top-[24%] h-36 w-[26rem] -rotate-6 rounded-full bg-gradient-to-r from-primary-200/40 via-cyan-200/28 to-transparent blur-3xl" />
          <div className="absolute right-[6%] top-[50%] h-40 w-[30rem] rotate-6 rounded-full bg-gradient-to-l from-cyan-200/36 via-sky-200/24 to-transparent blur-3xl" />
        </div>
      </div>
    </div>
  );
}
