'use client'

import { useEffect, useState } from "react";
import { Menu, X, Lock, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#accueil", label: "Accueil" },
  { href: "#apropos", label: "À propos" },
  { href: "#plateformes", label: "Plateformes" },
  { href: "#artistes", label: "Artistes" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-xs" : "bg-transparent")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 xl:gap-4">
          <a href="#accueil" className="flex items-center gap-2.5 group shrink-0">
            <img src="/brand/logo-mathias.jpg" alt="Logo Mathias Label" className="h-9 w-9 sm:h-10 sm:w-10 object-cover rounded-xl bg-black border border-border/60 shrink-0 shadow-xs" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-foreground whitespace-nowrap">Mathias Label</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-primary/80 mt-0.5 whitespace-nowrap">Distribution</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3.5 py-2 text-[13px] xl:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
            <ThemeToggle />
            <a href="/suivi" title="Espace Artiste - Suivi de distribution" aria-label="Espace Artiste - Suivi de distribution" className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 h-9 px-3 xl:px-3.5 rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 hover:border-primary/60 transition-all shadow-xs">
              <Disc3 className="h-3.5 w-3.5 text-primary animate-spin-vinyl shrink-0" />
              <span>Suivi de sortie</span>
            </a>
            <a href="/admin" title="Espace administrateur" aria-label="Espace administrateur" className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 h-9 px-2.5 xl:px-3 rounded-full border border-border bg-card/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/40 transition-all">
              <Lock className="h-3.5 w-3.5 shrink-0" /> Admin
            </a>
            <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="hidden xl:inline-block whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5">WhatsApp</a>
            <Button asChild size="sm" className="whitespace-nowrap shrink-0 bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-4 xl:px-5 shadow-xs">
              <a href="#tarifs">En profiter</a>
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <a href="/suivi" title="Suivi de sortie" aria-label="Suivi de sortie" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Disc3 className="h-4 w-4 animate-spin-vinyl" />
            </a>
            <a href="/admin" title="Espace administrateur" aria-label="Espace administrateur" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
              <Lock className="h-4 w-4" />
            </a>
            <button className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border text-foreground hover:bg-secondary/60 transition-colors" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60">{item.label}</a>
            ))}
            <div className="pt-2 pb-1">
              <ThemeToggle showLabel className="w-full justify-start rounded-xl h-11 px-4 border-border bg-card/60" />
            </div>
            <a href="/suivi" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              <Disc3 className="h-4 w-4 animate-spin-vinyl" /> Espace Artiste · Suivi de sortie
            </a>
            <Button asChild className="mt-2 bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full">
              <a href="#tarifs" onClick={() => setOpen(false)}>En profiter</a>
            </Button>
            <a href="/admin" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60">
              <Lock className="h-4 w-4" /> Espace administrateur
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
