import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Platforms } from "@/components/site/platforms";
import { Artists } from "@/components/site/artists";
import { CtaBanner } from "@/components/site/cta-banner";
import { Pricing } from "@/components/site/pricing";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Platforms />
        <Artists />
        <CtaBanner />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
