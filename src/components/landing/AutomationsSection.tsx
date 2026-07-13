import { MessageCircle, Mail, CalendarClock, Workflow, CreditCard } from "lucide-react";

const nodes = [
  { icon: MessageCircle, label: "Mensagens" },
  { icon: Mail, label: "E-mail" },
  { icon: CalendarClock, label: "Agenda" },
  { icon: Workflow, label: "Automações" },
  { icon: CreditCard, label: "Pagamentos" },
];

export default function AutomationsSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          Automações
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Automatize processos repetitivos.
        </h2>
        <p className="mt-4 text-muted-foreground">
          O Sistema Azas está preparado para conectar sua operação a ferramentas de
          mensagens, e-mail, agenda e pagamento.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto rounded-2xl border border-border bg-card p-10 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-[var(--shadow-elegant)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            A
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-2">
            Sistema Azas
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {nodes.map((n) => (
            <div
              key={n.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <n.icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-muted-foreground text-center">{n.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
