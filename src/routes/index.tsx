import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Calendar, Users, Sparkles } from "lucide-react";
import './index.css'
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
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
                 style={{ background: "var(--gradient-primary)" }}>A</div>
            <span className="font-semibold tracking-tight">Azas</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost"><Link to="/login">Entrar</Link></Button>
            <Button asChild><Link to="/signup">Criar conta</Link></Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-primary" />
          Sistema corporativo de gestão de agência
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.05]">
          A gestão completa da sua agência em um único lugar.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Clientes, demandas, calendário, financeiro e metas — organização premium para agências modernas.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="shadow-[var(--shadow-elegant)]">
            <Link to="/signup">Começar agora <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: Users, title: "Clientes & Leads", desc: "Cadastro completo e pipeline visual de prospecção." },
          { icon: Calendar, title: "Calendário", desc: "Visão por cliente e geral, com integrações futuras." },
          { icon: BarChart3, title: "Dashboard inteligente", desc: "Faturamento, metas e produtividade em tempo real." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
