'use client'

import { MessageCircle } from "lucide-react";

const NAV = [
  { href: "#accueil", label: "Accueil" },
  { href: "#apropos", label: "À propos" },
  { href: "#plateformes", label: "Plateformes" },
  { href: "#artistes", label: "Artistes" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          <div className="sm:col-span-2 md:col-span-1">
            <a href="#accueil" className="flex items-center gap-2.5">
              <img src="/brand/logo-mathias.jpg" alt="Logo Mathias Label" className="h-9 w-9 object-cover rounded-xl bg-black border border-border/60 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm sm:text-base font-bold text-foreground">Mathias Label</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-primary/80 mt-0.5">Distribution Musicale</span>
              </div>
            </a>
            <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Label indépendant de distribution musicale basé à Cotonou, Bénin. Nous mettons votre musique sur 150+ plateformes mondiales, avec accompagnement humain et 100 % de royalties pour l&apos;artiste.
            </p>
            <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="mt-4 sm:mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
            </a>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Navigation</h4>
            <ul className="mt-3.5 sm:mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}><a href={item.href} className="text-sm text-foreground/80 hover:text-primary transition-colors">{item.label}</a></li>
              ))}
              <li>
                <a href="/suivi" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Suivi de sortie (Artiste)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact</h4>
            <ul className="mt-3.5 sm:mt-4 space-y-2.5 text-sm text-foreground/80">
              <li><a href="mailto:contact@mr-kdistribution.com" className="hover:text-primary transition-colors break-all">contact@mr-kdistribution.com</a></li>
              <li><a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">WhatsApp · +225 01 57 30 76 77</a></li>
              <li><a href="https://wa.me/2250158161026" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">WhatsApp · +225 01 58 16 10 26</a></li>
              <li>Cotonou, Bénin</li>
              <li>Lun – Sam · 9h – 19h</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © 2026 Mathias Label. Tous droits réservés. Fait avec<span className="text-primary mx-1">♥</span>pour les artistes africains.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <a href="/suivi" className="text-primary hover:underline font-semibold">Suivi de sortie</a>
            <a href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</a>
            <a href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</a>
            <a href="/cgv" className="hover:text-foreground transition-colors">CGV</a>
            <a href="/admin" className="hover:text-foreground transition-colors">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
