type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const event = {
    name,
    payload,
    path: window.location.pathname,
    ts: new Date().toISOString(),
  };

  try {
    const key = "umrahyuk_analytics_events";
    const raw = window.localStorage.getItem(key);
    const events = raw ? (JSON.parse(raw) as typeof event[]) : [];
    events.push(event);
    window.localStorage.setItem(key, JSON.stringify(events.slice(-200)));
  } catch {
    // Ignore localStorage issues in restricted environments.
  }

  console.info("[analytics]", event);
}
