'use client'

import { useState, type ReactNode } from "react";
import { Music, LayoutGrid, Inbox, DollarSign, Users, RefreshCw, LogOut, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export type AdminView = "overview" | "demandes" | "revenue" | "artistes";

const NAV: { id: AdminView; label: string; icon: typeof Music; badgeKey?: "pending" }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { id: "demandes", label: "Demandes", icon: Inbox, badgeKey: "pending" },
  { id: "revenue", label: "Revenus", icon: DollarSign },
  { id: "artistes", label: "Artistes", icon: Users },
];

export function AdminShell({ current, onNavigate, onRefresh, onLogout, pendingCount = 0, children }: { current: AdminView; onNavigate: (v: AdminView) => void; onRefresh: () => void; onLogout: () => void; pendingCount?: number; children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col border-r border-border bg-card/40">
        <div className="px-5 py-5 border-b border-border">
          <a href="/admin" className="flex items-center gap-2.5">
            <img src="/brand/logo.png" alt="Logo MR - K Distribution" className="h-9 w-9 object-contain rounded-lg" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold text-foreground">MR - K</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80">/ADMIN</span>
            </div>
          </a>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const isActive = current === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", isActive ? "bg-gradient-gold text-black shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")}>
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badgeKey === "pending" && pendingCount > 0 && (
                  <span className={cn("inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold", isActive ? "bg-black/20 text-black" : "bg-primary text-black")}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pt-4 pb-12 border-t border-border space-y-1 mt-auto">
          <ThemeToggle showLabel className="w-full justify-start rounded-xl h-10 px-3 bg-transparent hover:bg-secondary/60 border-0 shadow-none text-muted-foreground" />
          <button onClick={onRefresh} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"><RefreshCw className="h-4 w-4 shrink-0" />Actualiser</button>
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"><ExternalLink className="h-4 w-4 shrink-0" />Voir le site</a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"><LogOut className="h-4 w-4 shrink-0" />Déconnexion</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-border bg-card/60 backdrop-blur px-4 h-14 flex items-center gap-2 overflow-x-auto">
          <a href="/admin" className="flex items-center gap-2 shrink-0 mr-2">
            <img src="/brand/logo.png" alt="Logo MR - K" className="h-8 w-8 object-contain rounded-lg" />
            <span className="font-display text-sm font-bold">MR - K</span>
          </a>
          {NAV.map((item) => {
            const isActive = current === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={cn("shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all", isActive ? "bg-gradient-gold text-black" : "bg-secondary/60 text-muted-foreground")}>
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {item.badgeKey === "pending" && pendingCount > 0 && (
                  <span className={cn("inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold", isActive ? "bg-black/20 text-black" : "bg-primary text-black")}>{pendingCount}</span>
                )}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <ThemeToggle className="h-8 w-8" />
            <button onClick={onLogout} className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary/60 text-muted-foreground" aria-label="Déconnexion"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ badge, title, titleAccent, subtitle, action }: { badge?: string; title: string; titleAccent?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
      <div>
        {badge && <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-1.5">{badge}</div>}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title} {titleAccent && <span className="text-gradient-gold">{titleAccent}</span>}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
