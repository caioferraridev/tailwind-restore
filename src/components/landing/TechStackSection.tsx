const stack = ["React", "TanStack Router", "Supabase", "PostgreSQL", "Tailwind CSS"];

const traits = ["Escalabilidade", "Segurança", "Multiusuários", "Crescimento contínuo"];

export default function TechStackSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="rounded-2xl border border-border bg-card p-10 md:p-14 shadow-[var(--shadow-card)]">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
            Tecnologia
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Construído com tecnologia moderna.
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {traits.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
