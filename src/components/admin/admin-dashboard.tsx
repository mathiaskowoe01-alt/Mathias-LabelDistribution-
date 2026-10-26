'use client'

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminShell, type AdminView } from "./admin-shell";
import { OverviewView } from "./views/overview-view";
import { DemandesView } from "./views/demandes-view";
import { RevenueView } from "./views/revenue-view";
import { ArtistesView } from "./views/artistes-view";
import { NewReleaseDialog } from "./new-release-dialog";
import type { Submission } from "@/lib/admin-types";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isNewReleaseOpen, setIsNewReleaseOpen] = useState(false);
  const [view, setView] = useState<AdminView>("overview");

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
      const res = await fetch(`/api/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      setSubmissions((prev) => prev.map((s) => s.id === id ? data.submission : s));
      toast({ title: "Statut mis à jour" });
    } catch (e) {
      toast({ title: "Erreur", description: "Mise à jour impossible.", variant: "destructive" });
    }
  }

  async function deleteSubmission(id: string) {
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      toast({ title: "Erreur", description: "Suppression impossible.", variant: "destructive" });
    }
  }

  async function handleLogout() {
    try { await fetch("/api/admin/logout", { method: "POST" }); } finally { onLogout(); }
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <>
      <AdminShell current={view} onNavigate={setView} onRefresh={load} onLogout={handleLogout} pendingCount={pendingCount}>
        {view === "overview" && (
          <OverviewView
            submissions={submissions}
            onNewRelease={() => setIsNewReleaseOpen(true)}
            onSimulate={handleSimulate}
            onSyncShowcase={handleSyncShowcase}
            isSeeding={isSeeding}
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
            onSimulate={handleSimulate}
          />
        )}
        {view === "revenue" && <RevenueView submissions={submissions} />}
        {view === "artistes" && <ArtistesView submissions={submissions} />}
      </AdminShell>

      <NewReleaseDialog
        open={isNewReleaseOpen}
        onClose={() => setIsNewReleaseOpen(false)}
        onSuccess={load}
      />
    </>
  );
}
