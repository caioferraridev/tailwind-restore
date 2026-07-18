import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

import Header from "@/components/landing/Header";
import HeroVisual from "@/components/landing/HeroVisual";
import ProblemSection from "@/components/landing/ProblemSection";
import ModulesSection from "@/components/landing/ModulesSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import DifferentiatorsSection from "@/components/landing/DifferentiatorsSection";
import AutomationsSection from "@/components/landing/AutomationsSection";
import AudienceSection from "@/components/landing/AudienceSection";
import TechStackSection from "@/components/landing/TechStackSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import Footer from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/app";
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-primary" />
          O centro de comando da sua operação
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.05]">
          Centralize sua operação.{" "}
          <span className="text-primary">Escale seu negócio.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          O Sistema Azas reúne clientes, projetos, demandas, equipe, agenda e
          financeiro em uma única plataforma inteligente.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="shadow-[var(--shadow-elegant)]">
            <Link to="/signup">
              Começar agora <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#produto">Conhecer plataforma</a>
          </Button>
        </div>

        <div className="mt-16">
          <HeroVisual />
        </div>
      </section>

      <ProblemSection />
      <ModulesSection />
      <ProductShowcase />
      <DifferentiatorsSection />
      <AutomationsSection />
      <AudienceSection />
      <TechStackSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
}
