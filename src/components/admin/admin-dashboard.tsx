'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminShell, type AdminView } from "./admin-shell";
import { OverviewView } from "./views/overview-view";
import { DemandesView } from "./views/demandes-view";
import { RevenueView } from "./views/revenue-view";
import { ArtistesView } from "./views/artistes-view";
import { NewReleaseDialog } from "./new-release-dialog";
import { AddProductionArtistDialog } from "./add-production-artist-dialog";
import {
  SubmissionDetailDialog,
  WhatsAppNotifyDialog,
  SubmissionsListModal,
  ArtistDetailModal,
} from "./shared/submission-dialogs";
import {
  type Submission,
  PLAN_LABELS,
  PAYMENT_LABELS,
} from "@/lib/admin-types";
import type { NotificationType } from "@/lib/whatsapp-notification";

type ListModalFilter =
  | { kind: "status"; status: "all" | "pending" | "approved" | "delivered" | "rejected" | "validated" }
  | { kind: "plan"; plan: string }
  | { kind: "payment"; paymentMethod: string }
  | { kind: "genre"; genre: string };

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isNewReleaseOpen, setIsNewReleaseOpen] = useState(false);
  const [isProdArtistOpen, setIsProdArtistOpen] = useState(false);
  const [prodArtistPrefillEmail, setProdArtistPrefillEmail] = useState<string | null>(null);
  const [view, setView] = useState<AdminView>("overview");

  // Filters passed when jumping to DemandesView
  const [demandesStatusFilter, setDemandesStatusFilter] = useState<string>("all");
  const [demandesPlanFilter, setDemandesPlanFilter] = useState<string>("all");

  // Global inspection modals
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<{ submission: Submission; type: NotificationType } | null>(null);
  const [listFilter, setListFilter] = useState<ListModalFilter | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<{ email: string; initialStatus?: string } | null>(null);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === selectedSubmissionId) || null,
    [submissions, selectedSubmissionId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      setSubmissions(data.submissions || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible de charger les soumissions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/submissions");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Erreur");
        if (!ignore) setSubmissions(data.submissions || []);
      } catch (e) {
        console.error(e);
        if (!ignore) {
          toast({ title: "Erreur", description: "Impossible de charger les soumissions.", variant: "destructive" });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
  }, [toast]);

  async function handleSyncShowcase() {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/submissions/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_showcase" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors de la synchronisation");
      toast({
        title: "Vitrine synchronisée !",
        description: data.message || "Les artistes de la vitrine ont été ajoutés à la base.",
      });
      await load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Échec synchronisation", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleSimulate() {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/submissions/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_one" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur simulation");
      toast({
        title: "Demande de test générée !",
        description: data.message || "Une nouvelle soumission a été ajoutée.",
      });
      await load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Échec simulation", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      setSubmissions((prev) => prev.map((s) => (s.id === id ? data.submission : s)));
      toast({ title: "Statut mis à jour" });
    } catch {
      toast({ title: "Erreur", description: "Mise à jour impossible.", variant: "destructive" });
    }
  }

  async function deleteSubmission(id: string) {
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible.", variant: "destructive" });
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      onLogout();
    }
  }

  function handleOpenProductionArtist(prefillEmail?: string | null) {
    setProdArtistPrefillEmail(prefillEmail || null);
    setIsProdArtistOpen(true);
  }

  // Compute list modal content based on clicked KPI / filter
  const listModalConfig = useMemo(() => {
    if (!listFilter) return null;

    if (listFilter.kind === "status") {
      const st = listFilter.status;
      if (st === "pending") {
        return {
          title: "Dossiers En attente",
          subtitle: "Projets en attente de validation ou de vérification studio",
          badgeKind: "pending",
          items: submissions.filter((s) => s.status === "pending"),
          targetStatus: "pending",
          targetPlan: "all",
        };
      }
      if (st === "approved") {
        return {
          title: "Sorties Approuvées (En production)",
          subtitle: "Projets validés en cours d'ingestion vers les plateformes",
          badgeKind: "approved",
          items: submissions.filter((s) => s.status === "approved"),
          targetStatus: "approved",
          targetPlan: "all",
        };
      }
      if (st === "delivered") {
        return {
          title: "Sorties Livrées (En ligne)",
          subtitle: "Projets officiellement disponibles sur les 150+ plateformes",
          badgeKind: "delivered",
          items: submissions.filter((s) => s.status === "delivered"),
          targetStatus: "delivered",
          targetPlan: "all",
        };
      }
      if (st === "rejected") {
        return {
          title: "Sorties Rejetées / Ajustement requis",
          subtitle: "Projets nécessitant une correction des fichiers ou métadonnées",
          badgeKind: "rejected",
          items: submissions.filter((s) => s.status === "rejected"),
          targetStatus: "rejected",
          targetPlan: "all",
        };
      }
      if (st === "validated") {
        return {
          title: "Dossiers Validés & Livrés",
          subtitle: "Ensemble des sorties approuvées et en ligne générant des revenus",
          badgeKind: "approved",
          items: submissions.filter((s) => s.status === "approved" || s.status === "delivered"),
          targetStatus: "approved",
          targetPlan: "all",
        };
      }
      return {
        title: "Toutes les sorties du catalogue",
        subtitle: "Vue complète de tous les projets enregistrés",
        badgeKind: "single",
        items: submissions,
        targetStatus: "all",
        targetPlan: "all",
      };
    }

    if (listFilter.kind === "plan") {
      const p = listFilter.plan;
      return {
        title: `Formule : ${PLAN_LABELS[p] || p}`,
        subtitle: "Liste des sorties soumises avec cette formule",
        badgeKind: p,
        items: submissions.filter((s) => s.plan === p),
        targetStatus: "all",
        targetPlan: p,
      };
    }

    if (listFilter.kind === "payment") {
      const pm = listFilter.paymentMethod;
      const label = PAYMENT_LABELS[pm] || (pm === "none" ? "Non défini" : pm);
      return {
        title: `Paiement : ${label}`,
        subtitle: "Sorties réglées via ce mode de paiement",
        badgeKind: "paid",
        items: submissions.filter((s) => (s.paymentMethod || "none") === pm),
        targetStatus: "all",
        targetPlan: "all",
      };
    }

    if (listFilter.kind === "genre") {
      const g = listFilter.genre;
      return {
        title: `Genre : ${g}`,
        subtitle: `Sorties classées dans le genre musical ${g}`,
        badgeKind: "ep",
        items: submissions.filter((s) => s.releaseGenre === g),
        targetStatus: "all",
        targetPlan: "all",
      };
    }

    return null;
  }, [listFilter, submissions]);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <>
      <AdminShell
        current={view}
        onNavigate={(v) => {
          if (v !== "demandes") {
            setDemandesStatusFilter("all");
            setDemandesPlanFilter("all");
          }
          setView(v);
        }}
        onRefresh={load}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      >
        {view === "overview" && (
          <OverviewView
            submissions={submissions}
            onNewRelease={() => setIsNewReleaseOpen(true)}
            onAddProductionArtist={() => handleOpenProductionArtist(null)}
            onSimulate={handleSimulate}
            onSyncShowcase={handleSyncShowcase}
            isSeeding={isSeeding}
            onSelectSubmission={(s) => setSelectedSubmissionId(s.id)}
            onSelectArtist={(email, initialStatus) => setSelectedArtist({ email, initialStatus })}
            onInspectStatus={(status) => setListFilter({ kind: "status", status })}
            onInspectPlan={(plan) => setListFilter({ kind: "plan", plan })}
            onInspectPayment={(paymentMethod) => setListFilter({ kind: "payment", paymentMethod })}
            onInspectGenre={(genre) => setListFilter({ kind: "genre", genre })}
            onNavigate={(v) => setView(v)}
          />
        )}
        {view === "demandes" && (
          <DemandesView
            submissions={submissions}
            loading={loading}
            onRefresh={load}
            onUpdateStatus={updateStatus}
            onDelete={deleteSubmission}
            onNewRelease={() => setIsNewReleaseOpen(true)}
            onAddProductionArtist={() => handleOpenProductionArtist(null)}
            onSimulate={handleSimulate}
            onSelectSubmission={(s) => setSelectedSubmissionId(s.id)}
            onOpenNotify={(submission, type) => setNotifyTarget({ submission, type })}
            initialStatusFilter={demandesStatusFilter}
            initialPlanFilter={demandesPlanFilter}
          />
        )}
        {view === "revenue" && (
          <RevenueView
            submissions={submissions}
            onInspectStatus={(status) => setListFilter({ kind: "status", status })}
            onInspectPlan={(plan) => setListFilter({ kind: "plan", plan })}
            onInspectPayment={(paymentMethod) => setListFilter({ kind: "payment", paymentMethod })}
          />
        )}
        {view === "artistes" && (
          <ArtistesView
            submissions={submissions}
            onAddProductionArtist={(prefillEmail) => handleOpenProductionArtist(prefillEmail)}
            onSelectArtist={(email, initialStatus) => setSelectedArtist({ email, initialStatus })}
            onInspectStatus={(status) => setListFilter({ kind: "status", status })}
            onInspectGenre={(genre) => setListFilter({ kind: "genre", genre })}
          />
        )}
      </AdminShell>

      {/* Modale Nouvelle Sortie Classique */}
      <NewReleaseDialog
        open={isNewReleaseOpen}
        onClose={() => setIsNewReleaseOpen(false)}
        onSuccess={load}
      />

      {/* Modale Ajouter un Artiste en Production */}
      <AddProductionArtistDialog
        open={isProdArtistOpen}
        onClose={() => setIsProdArtistOpen(false)}
        onSuccess={load}
        existingSubmissions={submissions}
        prefillArtistEmail={prodArtistPrefillEmail}
      />

      {/* Modale Liste par Statut / KPI (En attente, Approuvé, Livré, Formule, etc.) */}
      <SubmissionsListModal
        open={!!listModalConfig}
        title={listModalConfig?.title || ""}
        subtitle={listModalConfig?.subtitle}
        badgeKind={listModalConfig?.badgeKind}
        submissions={listModalConfig?.items || []}
        onClose={() => setListFilter(null)}
        onSelectSubmission={(s) => setSelectedSubmissionId(s.id)}
        onUpdateStatus={updateStatus}
        onOpenNotify={(submission, type) => setNotifyTarget({ submission, type })}
        onGoToDemandes={() => {
          if (listModalConfig) {
            setDemandesStatusFilter(listModalConfig.targetStatus === "validated" ? "approved" : listModalConfig.targetStatus);
            setDemandesPlanFilter(listModalConfig.targetPlan);
            setView("demandes");
          }
        }}
      />

      {/* Modale Fiche Artiste & Catalogue */}
      <ArtistDetailModal
        artistEmail={selectedArtist?.email || null}
        initialStatusFilter={selectedArtist?.initialStatus || "all"}
        submissions={submissions}
        onClose={() => setSelectedArtist(null)}
        onSelectSubmission={(s) => setSelectedSubmissionId(s.id)}
        onUpdateStatus={updateStatus}
        onOpenNotify={(submission, type) => setNotifyTarget({ submission, type })}
        onAddProjectForArtist={(email) => handleOpenProductionArtist(email)}
      />

      {/* Modale Fiche Complète d'une Sortie */}
      <SubmissionDetailDialog
        submission={selectedSubmission}
        onClose={() => setSelectedSubmissionId(null)}
        onUpdateStatus={updateStatus}
        onOpenNotify={(submission, type) => setNotifyTarget({ submission, type })}
      />

      {/* Modale Notification WhatsApp */}
      <WhatsAppNotifyDialog
        key={notifyTarget ? `${notifyTarget.submission.id}-${notifyTarget.type}` : "none"}
        target={notifyTarget}
        onClose={() => setNotifyTarget(null)}
      />
    </>
  );
}
