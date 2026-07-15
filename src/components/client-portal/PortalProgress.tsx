type Props = {
  total: number;
  completed: number;
};

export default function PortalProgress({
  total,
  completed,
}: Props) {
  const progress =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Progresso do Projeto
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe a evolução geral do trabalho.
          </p>

        </div>

        <span className="text-4xl font-bold text-primary">
          {progress}%
        </span>

      </div>

      <div className="mt-8 h-4 rounded-full bg-muted overflow-hidden">

        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="mt-4 flex justify-between text-sm text-muted-foreground">

        <span>
          {completed} concluídas
        </span>

        <span>
          {total} demandas
        </span>

      </div>

    </div>
  );
}