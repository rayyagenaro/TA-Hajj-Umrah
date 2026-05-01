import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { isMySqlConfigured } from "@/lib/mysql";
import { getRecentRecommendationLogs } from "@/lib/recommendationLogRepository";
import { clearAllLogsAction, deleteSingleLogAction } from "./actions";

export const metadata = {
  title: "Admin Logs Rekomendasi",
  description: "Monitoring rekapan pengguna yang mencoba sistem rekomendasi.",
};

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const dbConfigured = isMySqlConfigured();

  let logs = [] as Awaited<ReturnType<typeof getRecentRecommendationLogs>>;
  let loadError: string | null = null;

  if (dbConfigured) {
    try {
      logs = await getRecentRecommendationLogs(100);
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Gagal memuat data log.";
    }
  }

  const total = logs.length;
  const successCount = logs.filter((x) => x.status === "success").length;
  const withMainPackage = logs.filter((x) => Boolean(x.paket_utama)).length;
  const topPackage = getTopPackage(logs);

  return (
    <div className="container-section">
      <div className="mx-auto max-w-[92rem] space-y-6">
        <div>
          <Breadcrumbs
            items={[
              { href: "/", label: "Beranda" },
              { label: "Admin Logs" },
            ]}
          />
          <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Monitoring Internal
          </span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Rekapan Penggunaan Rekomendasi</h1>
          <p className="mt-2 text-sm text-slate-700">
            Menampilkan data terbaru dari tabel <code>recommendation_logs</code> untuk monitoring sistem.
          </p>
        </div>

        {!dbConfigured && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            MySQL belum dikonfigurasi. Isi <code>.env.local</code> dengan kredensial MySQL agar halaman ini bisa memuat data.
          </section>
        )}

        {dbConfigured && loadError && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Gagal mengambil data logs dari MySQL: {loadError}
          </section>
        )}

        {dbConfigured && !loadError && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard label="Total Log (100 terakhir)" value={String(total)} />
              <StatsCard label="Status Success" value={`${successCount}`} />
              <StatsCard label="Punya Paket Utama" value={`${withMainPackage}`} />
              <StatsCard label="Paket Terbanyak" value={topPackage ?? "-"} />
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="border-b border-black/5 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Log Terbaru</h2>
                    <p className="mt-1 text-xs text-slate-600">Urutan terbaru di atas. Menampilkan maksimal 100 data.</p>
                  </div>
                  <form action={clearAllLogsAction}>
                    <ConfirmSubmitButton
                      label="Clear All Logs"
                      confirmText="Yakin ingin menghapus semua logs? Aksi ini tidak bisa dibatalkan."
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    />
                  </form>
                </div>
              </div>
              <div className="overflow-x-auto lg:overflow-visible">
                <table className="w-full table-auto text-sm">
                  <thead className="bg-slate-50 text-left text-slate-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Waktu</th>
                      <th className="px-3 py-2 font-semibold">Nama</th>
                      <th className="px-3 py-2 font-semibold">Budget</th>
                      <th className="px-3 py-2 font-semibold">Usia</th>
                      <th className="px-3 py-2 font-semibold">Destinasi</th>
                      <th className="px-3 py-2 font-semibold">Paket Utama</th>
                      <th className="px-3 py-2 font-semibold">Alternatif</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={11} className="px-3 py-4 text-center text-slate-500">
                          Belum ada data log.
                        </td>
                      </tr>
                    )}
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-black/5 even:bg-slate-50/50">
                        <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{log.nama ?? "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(log.budget)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{log.usia ?? "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{log.destinasi_tambahan ?? "-"}</td>
                        <td className="max-w-[14rem] px-3 py-2 break-words">{log.paket_utama ?? "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{log.alternatif_count}</td>
                        <td className="px-3 py-2">
                          <span
                            className={[
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                              log.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <form action={deleteSingleLogAction}>
                            <input type="hidden" name="id" value={log.id} />
                            <ConfirmSubmitButton
                              label="Hapus"
                              confirmText="Hapus log ini? Aksi ini tidak bisa dibatalkan."
                              className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            />
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  const isLongValue = value.length > 18;
  return (
    <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-600">{label}</p>
      <p
        className={[
          "mt-2 font-bold leading-tight text-slate-900",
          isLongValue ? "break-all text-lg" : "text-2xl",
        ].join(" ")}
        title={value}
      >
        {value}
      </p>
    </article>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value: number | null): string {
  if (typeof value !== "number") return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTopPackage(
  logs: Awaited<ReturnType<typeof getRecentRecommendationLogs>>,
): string | null {
  const freq = new Map<string, number>();
  for (const row of logs) {
    if (!row.paket_utama) continue;
    freq.set(row.paket_utama, (freq.get(row.paket_utama) ?? 0) + 1);
  }
  let top: string | null = null;
  let max = 0;
  for (const [paket, count] of freq.entries()) {
    if (count > max) {
      top = paket;
      max = count;
    }
  }
  return top;
}
