import { CalendarDays } from "lucide-react";

type Props = {
  companyName?: string;
};

export default function PortalHeader({
  companyName,
}: Props) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Bom dia"
      : hour < 18
      ? "Boa tarde"
      : "Boa noite";

  return (
    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-4xl font-bold tracking-tight">
          {greeting}, {companyName || "Cliente"} 👋
        </h1>

        <p className="text-muted-foreground mt-2">
          Bem-vindo ao Portal do Cliente.
          Aqui você acompanha tudo em tempo real.
        </p>

      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3">

        <CalendarDays size={18} />

        <div>

          <p className="text-sm font-medium">

            {new Date().toLocaleDateString(
              "pt-BR",
              {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )}

          </p>

        </div>

      </div>

    </div>
  );
}