import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-3xl font-bold">
        Bem-vindo ao Portal do Cliente
      </h1>

      <p className="text-muted-foreground mt-2">
        Em breve você poderá acompanhar suas demandas,
        arquivos, pagamentos e relatórios.
      </p>

    </div>
  );
}