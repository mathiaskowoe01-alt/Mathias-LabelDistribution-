'use client'

import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SubpageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <img
              src="/brand/logo-mathias.jpg"
              alt="Logo Mathias Label"
              className="h-9 w-9 sm:h-10 sm:w-10 object-cover rounded-xl bg-black border border-border/60 shrink-0 shadow-xs"
            />
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                Mathias Label
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-primary/80 mt-0.5">
                Distribution Musicale
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5 h-9 text-xs sm:text-sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-4 text-xs">
              <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
