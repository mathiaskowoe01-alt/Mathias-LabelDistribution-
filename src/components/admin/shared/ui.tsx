'use client'

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type KpiAccent = "orange" | "gold" | "green" | "purple" | "red";

const ACCENT_STYLES: Record<
  KpiAccent,
  { bg: string; text: string; ring: string; glow: string }
> = {
  orange: {
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500/25",
    glow: "group-hover:shadow-[0_0_24px_-6px_rgba(249,115,22,0.35)]",
  },
  gold: {
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/25",
    glow: "group-hover:shadow-[0_0_24px_-6px_rgba(245,158,11,0.35)]",
  },
  green: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/25",
    glow: "group-hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.35)]",
  },
  purple: {
    bg: "bg-violet-500/15",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/25",
    glow: "group-hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.35)]",
  },
  red: {
    bg: "bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/25",
    glow: "group-hover:shadow-[0_0_24px_-6px_rgba(244,63,94,0.35)]",
  },
};

export interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: KpiAccent;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  accent = "orange",
  subtitle,
  trend,
}: KpiCardProps) {
  const s = ACCENT_STYLES[accent];
  return (
    <div className="group rounded-2xl border border-border bg-gradient-card p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Glow highlight on hover */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none",
          s.bg
        )}
      />

      <div className="flex items-start justify-between gap-2.5 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight line-clamp-2 min-h-[2.2em] flex items-center">
            {label}
          </div>
          <div className="mt-1 font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
            {value}
          </div>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold text-[11px]",
                    trend.positive !== false
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  )}
                >
                  {trend.positive !== false ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="truncate">{subtitle}</span>}
            </div>
          )}
        </div>
        <span
          className={cn(
            "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ring-1 mt-0.5 transition-all duration-200",
            s.bg,
            s.text,
            s.ring,
            s.glow
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-card p-5 sm:p-6 shadow-xs hover:border-border/80 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  delivered: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  single: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  ep: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  album: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

const DOT_STYLES: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  delivered: "bg-sky-500",
  single: "bg-amber-500",
  ep: "bg-violet-500",
  album: "bg-orange-500",
  paid: "bg-emerald-500",
};

export function StatusBadge({ kind, label }: { kind: string; label: string }) {
  const dotColor = DOT_STYLES[kind] || "bg-current";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        BADGE_STYLES[kind] || "bg-secondary text-foreground border-border"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      {label}
    </span>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 sm:p-5 relative overflow-hidden shadow-xs animate-pulse">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-7 w-28 rounded bg-muted" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 sm:p-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 ring-1 ring-border mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg sm:text-xl font-bold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
