import {
  Target,
  Users,
  ListChecks,
  CalendarDays,
  Wallet,
  UsersRound,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    icon: Target,
    title: "CRM",
    desc: "Controle leads, oportunidades e o funil comercial do primeiro contato ao fechamento.",
  },
  {
    icon: Users,
    title: "Gestão de clientes",
    desc: "Dados da empresa, serviços contratados, arquivos e histórico em um só lugar.",
  },
  {
    icon: ListChecks,
    title: "Projetos e demandas",
    desc: "Responsáveis, prioridades, prazos e horas — o que está atrasado fica visível.",
  },
  {
    icon: CalendarDays,
    title: "Agenda inteligente",
    desc: "Reuniões, entregas e prazos ligados diretamente ao cliente e ao projeto.",
  },
  {
    icon: Wallet,
    title: "Financeiro",
    desc: "Receitas, pagamentos e o quanto cada cliente representa para a operação.",
  },
  {
    icon: UsersRound,
    title: "Gestão de equipe",
    desc: "Cada pessoa sabe o que precisa fazer e qual é a sua prioridade agora.",
  },
];

export default function ModulesSection() {
  return (
    <section id="modulos" className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          A plataforma
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          O sistema operacional da sua empresa.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Não é apenas um CRM, nem apenas um gerenciador de tarefas. É onde a operação
          inteira acontece.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {modules.map((m) => (
          <div
            key={m.title}
            className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <m.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{m.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap text-sm font-medium">
          <span className="rounded-md bg-card border border-border px-3 py-1.5">Cliente</span>
          <ArrowRight className="h-4 w-4 text-primary" />
          <span className="rounded-md bg-card border border-border px-3 py-1.5">Projeto</span>
          <ArrowRight className="h-4 w-4 text-primary" />
          <span className="rounded-md bg-card border border-border px-3 py-1.5">Demanda</span>
          <ArrowRight className="h-4 w-4 text-primary" />
          <span className="rounded-md bg-card border border-border px-3 py-1.5">Financeiro</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Tudo conectado. Nenhum módulo vive isolado dos outros.
        </p>
      </div>
    </section>
  );
}
