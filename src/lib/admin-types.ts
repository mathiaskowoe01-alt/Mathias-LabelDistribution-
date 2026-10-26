export type Submission = {
  id: string;
  plan: string;
  status: string;
  amount: number;
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  artistWhatsapp: string | null;
  artistBio: string | null;
  artistCity: string | null;
  artistPhoto: string | null;
  socialLinks: string | null;
  releaseTitle: string;
  releaseGenre: string;
  releaseDate: string | null;
  releaseLanguage: string | null;
  coverArtUrl: string | null;
  explicit: boolean;
  paymentMethod: string | null;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
};

export type Track = {
  id: string;
  position: number;
  title: string;
  isrc: string | null;
  audioUrl: string | null;
  featuredArtists: string | null;
  duration: string | null;
  explicit: boolean;
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Nouveau",
  approved: "Approuvé",
  rejected: "Rejeté",
  delivered: "Livré",
};

export const PLAN_LABELS: Record<string, string> = {
  single: "Single Start",
  ep: "EP Boost",
  album: "Album Pro",
};

export const PAYMENT_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
  bank: "Virement",
  whatsapp: "WhatsApp",
};

export function formatFCFA(n: number) {
  return n.toLocaleString("fr-FR") + " F";
}

export function formatEuro(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return iso; }
}

export function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}
