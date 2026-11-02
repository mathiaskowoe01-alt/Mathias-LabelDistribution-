'use client'

import { useState, type ReactNode } from "react";
import {
  Music,
  LayoutGrid,
  Inbox,
  DollarSign,
  Users,
  RefreshCw,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export type AdminView = "overview" | "demandes" | "revenue" | "artistes";

const NAV: { id: AdminView; label: string; icon: typeof Music; badgeKey?: "pending" }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { id: "demandes", label: "Demandes", icon: Inbox, badgeKey: "pending" },
  { id: "revenue", label: "Revenus", icon: DollarSign },
  { id: "artistes", label: "Artistes", icon: Users },
];

export function AdminShell({
  current,
  onNavigate,
  onRefresh,
  onLogout,
  pendingCount = 0,
  children,
}: {
  current: AdminView;
  onNavigate: (v: AdminView) => void;
  onRefresh: () => void;
  onLogout: () => void;
  pendingCount?: number;
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSelectView(v: AdminView) {
    onNavigate(v);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar (240px - 256px) */}
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col border-r border-border bg-card/40 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <a href="/admin" className="flex items-center gap-2.5 min-w-0">
            <img src="/brand/logo-mathias.jpg" alt="Logo Mathias Label" className="h-9 w-9 object-cover rounded-xl bg-black border border-border/60 shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-display text-sm font-bold text-foreground truncate">Mathias Label</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80 mt-0.5">/ADMIN</span>
            </div>
          </a>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-gold text-black shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badgeKey === "pending" && pendingCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                      isActive ? "bg-black/20 text-black" : "bg-primary text-black"
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pt-4 pb-6 border-t border-border space-y-1 mt-auto">
          <ThemeToggle showLabel className="w-full justify-start rounded-xl h-10 px-3 bg-transparent hover:bg-secondary/60 border-0 shadow-none text-muted-foreground" />
          <button
            onClick={onRefresh}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            Actualiser
          </button>
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Voir le site
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Slide-In Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[82vw] h-full bg-card border-r border-border flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="px-4 py-4 border-b border-border flex items-center justify-between gap-2">
              <a href="/admin" className="flex items-center gap-2.5 min-w-0">
                <img src="/brand/logo-mathias.jpg" alt="Logo Mathias Label" className="h-8 w-8 object-cover rounded-xl bg-black border border-border/60 shrink-0" />
                <div className="flex flex-col leading-none min-w-0">
                  <span className="font-display text-xs font-bold text-foreground truncate">Mathias Label</span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-primary/80 mt-0.5">/ADMIN</span>
                </div>
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                aria-label="Fermer le menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {NAV.map((item) => {
                const isActive = current === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectView(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-gold text-black shadow-md font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badgeKey === "pending" && pendingCount > 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                          isActive ? "bg-black/20 text-black" : "bg-primary text-black"
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border space-y-1">
              <ThemeToggle showLabel className="w-full justify-start rounded-xl h-10 px-3 bg-transparent hover:bg-secondary/60 border-0 shadow-none text-muted-foreground" />
              <button
                onClick={() => {
                  onRefresh();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                Actualiser les données
              </button>
              <a
                href="/"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Voir le site public
              </a>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Sticky Top Header + Quick Nav */}
        <div className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border">
          <div className="px-4 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <a href="/admin" className="flex items-center gap-2 min-w-0">
                <img src="/brand/logo-mathias.jpg" alt="Logo Mathias Label" className="h-8 w-8 object-cover rounded-xl bg-black border border-border/60 shrink-0" />
                <div className="flex flex-col leading-none min-w-0">
                  <span className="font-display text-xs sm:text-sm font-bold truncate">Mathias Label</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-primary mt-0.5">/ADMIN</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onRefresh}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground"
                aria-label="Actualiser"
                title="Actualiser"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <ThemeToggle className="h-8 w-8" />
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary/60 text-muted-foreground hover:text-rose-400"
                aria-label="Déconnexion"
                title="Déconnexion"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Quick Switcher Bar */}
          <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-t border-border/50 bg-secondary/20 scrollbar-none">
            {NAV.map((item) => {
              const isActive = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    isActive
                      ? "bg-gradient-gold text-black font-semibold shadow-xs"
                      : "bg-card/80 border border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                  {item.badgeKey === "pending" && pendingCount > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold",
                        isActive ? "bg-black/20 text-black" : "bg-primary text-black"
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  badge,
  title,
  titleAccent,
  subtitle,
  action,
}: {
  badge?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3.5 sm:gap-4 mb-6 sm:mb-7">
      <div className="min-w-0">
        {badge && (
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-1.5">
            {badge}
          </div>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          {title} {titleAccent && <span className="text-gradient-gold">{titleAccent}</span>}
        </h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
