'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "2250157307677";
const WHATSAPP_MESSAGE = "Bonjour MR - K, je souhaite distribuer ma musique.";

export function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Nom: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text || encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, "_blank");
    toast({ title: "WhatsApp ouvert", description: "Votre message est pré-rempli, à vous de l'envoyer." });
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">Contact</span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">Parlons de <span className="text-gradient-gold">votre musique.</span></h2>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Une question, un projet, un doute ? On répond vite, et humainement. Choisissez le canal qui vous convient le mieux.</p>

            <div className="mt-10 space-y-4">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-secondary/40 transition-all">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-black shadow-lg"><MessageCircle className="h-6 w-6" /></span>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">WhatsApp</div>
                  <div className="text-sm text-muted-foreground">+225 01 57 30 76 77 · réponse en moins de 2h en journée</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>

              <a href="mailto:contact@mr-kdistribution.com" className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-secondary/40 transition-all">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-primary"><Mail className="h-6 w-6" /></span>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Email</div>
                  <div className="text-sm text-muted-foreground">contact@mr-kdistribution.com</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-primary"><MapPin className="h-6 w-6" /></span>
                  <div>
                    <div className="font-semibold text-foreground">Cotonou, Bénin</div>
                    <div className="text-sm text-muted-foreground">Distribution pour l'Afrique et le monde</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-primary"><MessageCircle className="h-6 w-6" /></span>
                  <div>
                    <div className="font-semibold text-foreground">+225 01 58 16 10 26</div>
                    <div className="text-sm text-muted-foreground">Second numéro WhatsApp</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:col-span-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-primary"><Clock className="h-6 w-6" /></span>
                  <div>
                    <div className="font-semibold text-foreground">Lun – Sam</div>
                    <div className="text-sm text-muted-foreground">9h – 19h</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="rounded-3xl border border-border bg-gradient-card p-7 sm:p-9">
            <h3 className="font-display text-2xl font-bold tracking-tight">Envoyez-nous un message</h3>
            <p className="mt-2 text-sm text-muted-foreground">En cliquant, WhatsApp s'ouvre avec votre message pré-rempli.</p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nom</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom d'artiste" required className="h-12 rounded-xl bg-background/60 border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required className="h-12 rounded-xl bg-background/60 border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Parlez-nous de votre projet musical..." required rows={5} className="rounded-xl bg-background/60 border-border resize-none" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold text-base shadow-lg">
                <Send className="h-4 w-4 mr-2" /> Envoyer sur WhatsApp
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
