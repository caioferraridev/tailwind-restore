import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  CalendarDays,
  Wallet,
} from "lucide-react";

/**
 * Para trocar pelas telas reais do sistema:
 * 1. Coloque os prints em /src/assets/product-preview/ (ex: dashboard.png, clientes.png...)
 * 2. Importe a imagem e passe no campo `image` do item correspondente abaixo.
 * 3. Enquanto `image` for null, o componente mostra uma prévia ilustrativa
 *    equivalente, então o layout nunca fica quebrado por falta de asset.
 */
type ShowcaseItem = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  caption: string;
  image: string | null;
};

const items: ShowcaseItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "app.azas.com/dashboard",
    caption: "Tenha uma visão completa da sua operação em tempo real.",
    image: null,
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: Users,
    path: "app.azas.com/clientes",
    caption: "Centralize todas as informações dos seus clientes.",
    image: null,
  },
  {
    key: "demandas",
    label: "Demandas",
    icon: ListChecks,
    path: "app.azas.com/demandas",
    caption: "Organize tarefas, prioridades e entregas.",
    image: null,
  },
  {
    key: "agenda",
    label: "Calendário",
    icon: CalendarDays,
    path: "app.azas.com/agenda",
    caption: "Controle compromissos e prazos.",
    image: null,
  },
  {
    key: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    path: "app.azas.com/financeiro",
    caption: "Visualize receitas, pagamentos e indicadores.",
    image: null,
  },
];

function FallbackPreview({ itemKey }: { itemKey: string }) {
  if (itemKey === "dashboard") {
    return (
      <div className="grid grid-cols-3 gap-4 h-full p-6">
        {["Receita", "Clientes ativos", "Demandas"].map((label) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold mt-2">—</p>
          </div>
        ))}
        <div className="col-span-3 rounded-lg border border-border bg-card p-4 flex items-end gap-1.5 h-24">
          {[30, 55, 40, 70, 60, 85, 50, 65, 45, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-primary/25" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (itemKey === "clientes") {
    return (
      <div className="p-6 space-y-2 h-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="h-8 w-8 rounded-full bg-primary/15" />
            <div className="flex-1 space-y-1">
              <div className="h-2.5 w-32 rounded bg-muted" />
              <div className="h-2 w-20 rounded bg-muted/60" />
            </div>
            <div className="h-6 w-16 rounded-full bg-primary/10" />
          </div>
        ))}
      </div>
    );
  }

  if (itemKey === "demandas") {
    return (
      <div className="grid grid-cols-3 gap-4 h-full p-6">
        {["A fazer", "Em andamento", "Concluído"].map((col) => (
          <div key={col} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{col}</p>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 rounded-md bg-muted/60" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (itemKey === "agenda") {
    return (
      <div className="p-6 h-full">
        <div className="grid grid-cols-7 gap-2 max-w-sm">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`h-8 w-8 rounded-md flex items-center justify-center text-[10px] ${
                i === 15 ? "bg-primary text-primary-foreground font-semibold" : "bg-muted/60"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3 h-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="space-y-1">
            <div className="h-2.5 w-40 rounded bg-muted" />
            <div className="h-2 w-24 rounded bg-muted/60" />
          </div>
          <div className="h-6 w-20 rounded-full bg-green-500/10" />
        </div>
      ))}
    </div>
  );
}

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <section id="produto" className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
          Produto
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Conheça o Sistema Azas por dentro
        </h2>
        <p className="mt-4 text-muted-foreground">
          Uma plataforma completa para controlar toda sua operação em um único ambiente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {items.map((item, i) => (
          <button
            key={item.key}
            onClick={() => setActive(i)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === i
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Browser mockup */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)] overflow-hidden transition-all duration-500">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <div className="ml-3 flex-1 rounded-md bg-background/80 border border-border px-3 py-1 text-xs text-muted-foreground">
              {current.path}
            </div>
          </div>

          <div className="relative h-[420px] bg-gradient-to-br from-muted/20 to-background">
            <div key={current.key} className="absolute inset-0 animate-in fade-in duration-500">
              {current.image ? (
                <img
                  src={current.image}
                  alt={`Tela de ${current.label} do Sistema Azas`}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <FallbackPreview itemKey={current.key} />
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-6">{current.caption}</p>
      </div>
    </section>
  );
}
