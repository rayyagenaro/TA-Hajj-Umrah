export interface VideoResource {
  id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  publishedAt: string;
}

export const videoResources: VideoResource[] = [
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
