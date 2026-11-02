'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, MapPin, Clock, Send, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "2250157307677";
const WHATSAPP_MESSAGE = "Bonjour Mathias Label, je souhaite distribuer ma musique.";

export function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const nameError = name.trim().length < 2 ? "Veuillez indiquer votre nom d'artiste." : "";
  const emailError = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? "Veuillez indiquer un email valide." : "";
  const messageError = message.trim().length < 5 ? "Veuillez décrire brièvement votre demande." : "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError || emailError || messageError) {
      setShowErrors(true);
      toast({
        title: "Champs incomplets",
        description: "Veuillez vérifier les champs indiqués en rouge.",
        variant: "destructive",
      });
      return;
    }
    setShowErrors(false);
    const lines = [
      `Nom : ${name.trim()}`,
      `Email : ${email.trim()}`,
      phone.trim() ? `Téléphone : ${phone.trim()}` : "",
      "",
      message.trim(),
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n") || WHATSAPP_MESSAGE)}`;
    window.open(url, "_blank");
    toast({ title: "WhatsApp ouvert", description: "Votre message est pré-rempli, à vous de l'envoyer." });
  };

  return (
    <section id="contact" className="relative py-20 sm:py-32 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              Contact
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Parlons de <span className="text-gradient-gold">votre musique.</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted-foreground leading-relaxed">
              Une question, un projet, un doute ? On répond vite, et humainement. Choisissez le canal qui vous convient le mieux.
            </p>

            <div className="mt-8 sm:mt-10 space-y-3.5 sm:space-y-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/40 hover:bg-secondary/40 transition-all hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-black shadow-lg">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base text-foreground">WhatsApp</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    +225 01 57 30 76 77 · réponse &lt; 2h
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>

              <a
                href="mailto:contact@mr-kdistribution.com"
                className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/40 hover:bg-secondary/40 transition-all hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border text-primary">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base text-foreground">Email</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    contact@mr-kdistribution.com
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border text-primary">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-foreground">Cotonou, Bénin</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Afrique &amp; monde entier</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border text-primary">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-foreground font-mono">+225 01 58 16 10 26</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Second numéro WhatsApp</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 sm:col-span-2">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border text-primary">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-foreground">Lun – Sam · 9h – 19h</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Accompagnement humain dédié aux artistes</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border bg-gradient-card p-5 sm:p-9 shadow-lg"
          >
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Envoyez-nous un message</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              En cliquant, WhatsApp s&apos;ouvre directement avec votre message pré-rempli.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Nom d&apos;artiste *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Mïko Sun"
                    aria-invalid={showErrors && !!nameError}
                    className="h-11 sm:h-12 rounded-xl bg-background/60 border-border"
                  />
                  {showErrors && nameError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {nameError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    aria-invalid={showErrors && !!emailError}
                    className="h-11 sm:h-12 rounded-xl bg-background/60 border-border"
                  />
                  {showErrors && emailError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {emailError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">Téléphone / WhatsApp (optionnel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 01 00 00 00 00"
                  className="h-11 sm:h-12 rounded-xl bg-background/60 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs sm:text-sm font-medium">Votre message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Parlez-nous de votre single, EP ou album..."
                  rows={4}
                  aria-invalid={showErrors && !!messageError}
                  className="rounded-xl bg-background/60 border-border resize-none"
                />
                {showErrors && messageError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {messageError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold text-sm sm:text-base shadow-lg transition-transform active:scale-[0.99]"
              >
                <Send className="h-4 w-4 mr-2 shrink-0" /> Envoyer sur WhatsApp
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
