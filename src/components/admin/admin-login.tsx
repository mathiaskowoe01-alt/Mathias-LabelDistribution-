'use client'

import { useState } from "react";
import { Lock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Connexion échouée");
      toast({ title: "Connecté", description: "Bienvenue dans l'espace administrateur." });
      onSuccess();
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Connexion échouée",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-noise relative">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[28rem] w-[40rem] rounded-full bg-primary/15 blur-[140px]" />

      <a href="/" className="relative flex items-center gap-2.5 mb-10">
        <img src="/brand/logo.png" alt="Logo MR - K Distribution" className="h-10 w-10 object-contain rounded-lg" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold text-foreground">MR - K</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80">Distribution</span>
        </div>
      </a>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold text-black shadow-lg glow-gold">
              <ShieldCheck className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold tracking-tight">Espace administrateur</h1>
            <p className="mt-2 text-sm text-muted-foreground">Accès réservé à l'équipe MR - K Distribution.</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Entrez votre mot de passe" required autoFocus className="h-12 rounded-xl bg-background/60" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold shadow-lg">
              {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connexion...</>) : (<><Lock className="h-4 w-4 mr-2" /> Se connecter</>)}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}
