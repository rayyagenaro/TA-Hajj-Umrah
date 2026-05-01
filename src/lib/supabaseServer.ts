export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config.url || !config.serviceRoleKey) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const url = `${config.url.replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request gagal dengan status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
