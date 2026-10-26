import { type Submission, PLAN_LABELS } from "./admin-types";

export type NotificationType = "approved" | "delivered" | "rejected" | "payment_reminder" | "custom";

/**
 * Nettoie et formate le numéro de téléphone pour l'API WhatsApp
 */
export function formatWhatsAppPhone(phone: string, whatsapp?: string | null): string {
  const raw = (whatsapp && whatsapp.trim().length >= 6 ? whatsapp : phone) || "";
  let digits = raw.replace(/[^0-9]/g, "");

  // Si le numéro commence par 0 et fait 8 ou 10 chiffres (Afrique de l'Ouest)
  // Par défaut, indicatif Bénin (229) ou Côte d'Ivoire (225)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  return digits;
}

/**
 * Génère le message WhatsApp pré-formaté selon le statut et le dossier
 */
export function buildWhatsAppNotificationMessage(
  submission: Submission,
  type: NotificationType,
  options?: {
    customNote?: string;
    dspLinks?: string;
    isrcCodes?: string;
  }
): string {
  const planLabel = PLAN_LABELS[submission.plan] || submission.plan;
  const artist = submission.artistName;
  const project = submission.releaseTitle;
  const tracksCount = submission.tracks?.length || 1;

  switch (type) {
    case "approved":
      return (
        `🎵 *MR - K DISTRIBUTION — VALIDATION DE VOTRE PROJET* 🎵\n\n` +
        `Bonjour *${artist}* !\n\n` +
        `Excellente nouvelle : votre projet *« ${project} »* (${planLabel}, ${tracksCount} titre${tracksCount > 1 ? "s" : ""}) a été examiné et *VALIDÉ* par notre équipe artistique !\n\n` +
        `📦 *Prochaines étapes :*\n` +
        `• Génération des codes ISRC & UPC officiels\n` +
        `• Encodage haute fidélité\n` +
        `• Envoi aux 150+ plateformes (Spotify, Apple Music, Deezer, TikTok, Boomplay, etc.)\n\n` +
        (options?.customNote ? `💬 *Note de l'équipe :* ${options.customNote}\n\n` : "") +
        `Vous recevrez un message dès que vos morceaux seront disponibles à l'écoute.\n\n` +
        `_L'équipe MR - K Distribution · Ta musique, notre mission._`
      );

    case "delivered":
      return (
        `🚀 *MR - K DISTRIBUTION — VOTRE MUSIQUE EST EN LIGNE !* 🚀\n\n` +
        `Félicitations *${artist}* !\n\n` +
        `Votre sortie *« ${project} »* est désormais *OFFICIELLEMENT DISPONIBLE* sur l'ensemble des plateformes partenaires mondiales (Spotify, Apple Music, Deezer, TikTok, Boomplay, Audiomack, YouTube Music, etc.) !\n\n` +
        `✨ *Rappel de vos droits :*\n` +
        `• 100 % de vos royalties vous appartiennent intégralement.\n` +
        `• Vos rapports de streams seront consultables mensuellement.\n\n` +
        (options?.dspLinks ? `🔗 *Liens d'écoute :*\n${options.dspLinks}\n\n` : "") +
        (options?.isrcCodes ? `🏷️ *Codes ISRC :*\n${options.isrcCodes}\n\n` : "") +
        (options?.customNote ? `💬 *Note :* ${options.customNote}\n\n` : "") +
        `Taguez *@mr_k_distribution* sur Instagram et TikTok pour être relayé sur nos pages officielles !\n\n` +
        `_Plein succès à votre œuvre !_`
      );

    case "rejected":
      return (
        `⚠️ *MR - K DISTRIBUTION — AJUSTEMENT REQUIS SUR VOTRE PROJET*\n\n` +
        `Bonjour *${artist}*,\n\n` +
        `Nous avons examiné votre soumission pour le projet *« ${project} »*.\n\n` +
        `Certains éléments nécessitent une correction pour être acceptés par les plateformes de streaming :\n` +
        `• ${options?.customNote || "Vérification requise sur la qualité audio ou la pochette (doit être carrée min 3000x3000px, sans logos non autorisés)."}\n\n` +
        `Répondez directement à ce message WhatsApp avec vos fichiers corrigés pour que nous puissions finaliser la mise en ligne sans frais supplémentaires.\n\n` +
        `_L'équipe MR - K Distribution_`
      );

    case "payment_reminder":
      return (
        `💳 *MR - K DISTRIBUTION — CONFIRMATION DE VOTRE FORMULE*\n\n` +
        `Bonjour *${artist}* !\n\n` +
        `Nous avons bien reçu votre demande de distribution pour le projet *« ${project} »* (Formule *${planLabel}* — ${submission.amount.toLocaleString("fr-FR")} FCFA).\n\n` +
        `Pour lancer l'ingestion de vos titres sous 48h, merci de nous transmettre le justificatif de règlement (Mobile Money MTN / Moov ou virement).\n\n` +
        (options?.customNote ? `💬 *Détails :* ${options.customNote}\n\n` : "") +
        `Nous restons disponibles ici pour vous guider !\n\n` +
        `_L'équipe MR - K Distribution_`
      );

    case "custom":
    default:
      return (
        `Bonjour *${artist}*,\n\n` +
        `Concernant votre sortie *« ${project} »* chez MR - K Distribution :\n\n` +
        `${options?.customNote || "Merci de nous contacter pour le suivi de votre projet."}\n\n` +
        `_MR - K Distribution_`
      );
  }
}

/**
 * Ouvre le lien WhatsApp Web / Mobile avec le message encodé
 */
export function openWhatsAppNotification(
  submission: Submission,
  type: NotificationType,
  options?: {
    customNote?: string;
    dspLinks?: string;
    isrcCodes?: string;
  }
) {
  const phone = formatWhatsAppPhone(submission.artistPhone, submission.artistWhatsapp);
  const text = buildWhatsAppNotificationMessage(submission, type, options);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
