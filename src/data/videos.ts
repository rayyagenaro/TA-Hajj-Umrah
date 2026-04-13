export interface VideoResource {
  id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  publishedAt: string;
}

type RawVideoResource = VideoResource;

const rawVideoResources: RawVideoResource[] = [
  {
    id: "video-1",
    title: "Sesuaikan Perkembangan Regulasi Arab Saudi, Umrah Mandiri Dilegalkan",
    youtubeId: "AtIUOxWCNEU?si=04qmeCiY1LTl3800",
    youtubeUrl: "https://youtu.be/AtIUOxWCNEU?si=04qmeCiY1LTl3800",
    publishedAt: "2025-10-26",
  },
  {
    id: "video-2",
    title: "MoU Kementerian Haji dan Umrah RI dengan Kementerian Haji Saudi",
    youtubeId: "XJBibv9_FBI?si=mm8K36cu9EFa5Gnm",
    youtubeUrl: "https://youtu.be/XJBibv9_FBI?si=mm8K36cu9EFa5Gnm",
    publishedAt: "2018-2-3",
  },
  {
    id: "video-3",
    title: "Menteri dan Wakil Menteri Haji dan Umrah bertemu dengan Menteri",
    youtubeId: "EcF3snr1cIU?si=Rko2snw07ehIWKgQ",
    youtubeUrl: "https://youtu.be/EcF3snr1cIU?si=Rko2snw07ehIWKgQ",
    publishedAt: "2025-11-08",
  },
];

export const videoResources: VideoResource[] = validateAndNormalizeVideos(rawVideoResources);

function validateAndNormalizeVideos(items: RawVideoResource[]): VideoResource[] {
  const seen = new Set<string>();
  return items.map((item, index) => {
    const row = index + 1;

    assertNonEmpty(item.id, `videos[${row}].id`);
    assertNonEmpty(item.title, `videos[${row}].title`);
    assertNonEmpty(item.youtubeUrl, `videos[${row}].youtubeUrl`);
    assertNonEmpty(item.publishedAt, `videos[${row}].publishedAt`);

    if (seen.has(item.id)) {
      throw new Error(`Duplicate video id detected: ${item.id}`);
    }
    seen.add(item.id);

    const normalizedYoutubeUrl = normalizeYouTubeUrl(item.youtubeUrl, `videos[${row}].youtubeUrl`);
    const normalizedYoutubeId = normalizeYouTubeId(item.youtubeId, normalizedYoutubeUrl, `videos[${row}].youtubeId`);
    const normalizedDate = normalizeDate(item.publishedAt, `videos[${row}].publishedAt`);

    return {
      ...item,
      youtubeUrl: normalizedYoutubeUrl,
      youtubeId: normalizedYoutubeId,
      publishedAt: normalizedDate,
    };
  });
}

function assertNonEmpty(value: string, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${label}: value is required.`);
  }
}

function normalizeYouTubeUrl(value: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid ${label}: must be a valid URL.`);
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "youtube.com" && host !== "youtu.be") {
    throw new Error(`Invalid ${label}: must point to youtube.com or youtu.be.`);
  }
  return parsed.toString();
}

function normalizeYouTubeId(youtubeId: string, youtubeUrl: string, label: string): string {
  const fromField = extractVideoIdFromText(youtubeId);
  if (fromField) return fromField;

  const fromUrl = extractVideoIdFromUrl(youtubeUrl);
  if (fromUrl) return fromUrl;

  throw new Error(`Invalid ${label}: unable to resolve YouTube video id.`);
}

function extractVideoIdFromText(value: string): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const sanitized = trimmed.split(/[?&]/)[0];
  return isYouTubeVideoId(sanitized) ? sanitized : null;
}

function extractVideoIdFromUrl(value: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const pathId = parsed.pathname.replace("/", "").trim();
    return isYouTubeVideoId(pathId) ? pathId : null;
  }

  if (host === "youtube.com") {
    const v = parsed.searchParams.get("v");
    if (v && isYouTubeVideoId(v)) return v;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const embedId = parts[0] === "embed" ? parts[1] : null;
    if (embedId && isYouTubeVideoId(embedId)) return embedId;
  }

  return null;
}

function isYouTubeVideoId(value: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(value);
}

function normalizeDate(value: string, label: string): string {
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    throw new Error(`Invalid ${label}: expected YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ${label}: invalid calendar date.`);
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
