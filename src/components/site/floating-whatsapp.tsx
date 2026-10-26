'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "2250157307677";
const WHATSAPP_MESSAGE = "Bonjour MR - K, je souhaite distribuer ma musique.";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <AnimatePresence>
        {open && visible && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2 }} className="fixed bottom-24 right-4 sm:right-6 z-50 w-72 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-[#25D366] text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur"><MessageCircle className="h-5 w-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">MR - K Distribution</div>
                <div className="text-xs text-white/80 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> En ligne maintenant</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-white/20 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4">
              <div className="rounded-xl rounded-tl-none bg-secondary/60 p-3 text-sm text-foreground/90">Salut 👋 Une question sur la distribution de ta musique ? On répond vite ici, en général en moins de 2h en journée.</div>
              <a href={waUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="mt-3 inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-sm transition-colors">Ouvrir WhatsApp <ArrowRight className="h-4 w-4" /></a>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">+225 01 57 30 76 77</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }} onClick={() => setOpen((v) => !v)} aria-label="Contacter sur WhatsApp" aria-expanded={open} className="fixed bottom-5 right-4 sm:right-6 z-50 group flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
            <span className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl ring-4 ring-[#25D366]/20 group-hover:scale-105 transition-transform">
              {open ? (<X className="h-7 w-7" strokeWidth={2.4} />) : (<WhatsAppGlyph className="h-8 w-8 sm:h-9 sm:w-9" />)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  );
}
