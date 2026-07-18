import { MessageSquareX, ListX, EyeOff, UsersRound, LineChart } from "lucide-react";

const pains = [
  {
    icon: MessageSquareX,
    title: "Clientes desorganizados",
    desc: "Informações espalhadas entre WhatsApp, planilhas e anotações soltas.",
  },
  {
    icon: ListX,
    title: "Demandas perdidas",
    desc: "Tarefas sem responsável claro, sem prazo e sem histórico.",
  },
  {
    icon: EyeOff,
    title: "Falta de acompanhamento",
    desc: "Ninguém sabe em que etapa cada projeto realmente está.",
  },
  {
    icon: UsersRound,
    title: "Equipe desalinhada",
    desc: "Cada pessoa organiza o trabalho do seu próprio jeito.",
  },
  {
    icon: LineChart,
    title: "Falta de visão financeira",
    desc: "Receita, pagamentos e inadimplência sem nenhum painel central.",
  },
];

export default function ProblemSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          O problema
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Seu negócio ainda depende de planilhas, mensagens e informações espalhadas?
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {pains.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-border bg-card/60 p-5 text-left"
          >
            <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <p.icon className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-lg font-medium mt-14">
        O <span className="text-primary">Sistema Azas</span> centraliza tudo isso em um
        único ambiente.
      </p>
    </section>
  );
}
