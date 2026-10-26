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
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <a href="#accueil" className="flex items-center gap-2.5">
              <img src="/brand/logo.png" alt="Logo MR - K Distribution" className="h-9 w-9 object-contain rounded-lg" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-bold text-foreground">MR - K</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80">Distribution</span>
              </div>
            </a>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">Label indépendant de distribution musicale basé à Cotonou, Bénin. Nous mettons votre musique sur 150+ plateformes mondiales, avec accompagnement humain et 100 % de royalties pour l'artiste.</p>
            <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
            </a>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Navigation</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}><a href={item.href} className="text-sm text-foreground/80 hover:text-primary transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
              <li><a href="mailto:contact@mr-kdistribution.com" className="hover:text-primary transition-colors">contact@mr-kdistribution.com</a></li>
              <li><a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">WhatsApp · +225 01 57 30 76 77</a></li>
              <li><a href="https://wa.me/2250158161026" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">WhatsApp · +225 01 58 16 10 26</a></li>
              <li>Cotonou, Bénin</li>
              <li>Lun – Sam · 9h – 19h</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">© 2026 MR - K Distribution. Tous droits réservés. Fait avec<span className="text-primary mx-1">♥</span>pour les artistes africains.</p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
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
