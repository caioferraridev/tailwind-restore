import { Rocket, Zap, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export default function DifferentiatorsSection() {
  return (
    <section id="diferenciais" className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          Diferenciais
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Por que escolher o Sistema Azas?
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Large highlighted card spanning 2 columns */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
              <Rocket className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tudo conectado</h3>
            <p className="text-muted-foreground max-w-md">
              Cliente, projeto, demanda e financeiro não são telas isoladas. Uma
              informação atualizada em um lugar reflete em todos os outros.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-md bg-muted px-2.5 py-1">Cliente</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span className="rounded-md bg-muted px-2.5 py-1">Projeto</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span className="rounded-md bg-muted px-2.5 py-1">Demanda</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span className="rounded-md bg-muted px-2.5 py-1">Financeiro</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Feito para operação real</h3>
          <p className="text-muted-foreground text-sm">
            Nasceu dentro de uma agência, resolvendo os problemas do dia a dia — não
            desenhado em um vácuo.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Visão estratégica</h3>
          <p className="text-muted-foreground text-sm">
            Dados organizados para decisões melhores, não apenas tarefas marcadas
            como concluídas.
          </p>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Plataforma segura e escalável</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Arquitetura preparada para múltiplos usuários e crescimento, sem
            reescrever o sistema conforme sua empresa cresce.
          </p>
        </div>
      </div>
    </section>
  );
}
