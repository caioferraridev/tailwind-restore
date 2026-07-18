import { Megaphone, Briefcase, Users2, Handshake, Laptop } from "lucide-react";

const audiences = [
  {
    icon: Megaphone,
    title: "Agências de marketing",
    desc: "Clientes, conteúdos, campanhas, demandas e financeiro sob controle.",
  },
  {
    icon: Briefcase,
    title: "Empresas de serviços",
    desc: "Projetos, clientes, equipes e processos em um único ambiente.",
  },
  {
    icon: Handshake,
    title: "Consultorias",
    desc: "Acompanhamento próximo de cada cliente, do contrato à entrega.",
  },
  {
    icon: Users2,
    title: "Times comerciais",
    desc: "Pipeline de leads e oportunidades sem depender de planilhas soltas.",
  },
  {
    icon: Laptop,
    title: "Profissionais freelancers",
    desc: "Estrutura profissional sem precisar de várias ferramentas separadas.",
  },
];

export default function AudienceSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          Para quem é
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Para quem é o Sistema Azas?
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
        {audiences.map((a) => (
          <div
            key={a.title}
            className="min-w-[220px] md:min-w-0 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <a.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{a.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
