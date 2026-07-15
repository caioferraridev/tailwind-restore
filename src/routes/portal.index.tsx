import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";
import PortalStats from "@/components/client-portal/PortalStats";
import PortalProgress from "@/components/client-portal/PortalProgress";
import PortalDemandsTable from "@/components/client-portal/PortalDemandsTable";
import PortalEvents from "@/components/client-portal/PortalEvents";
import PortalFiles from "@/components/client-portal/PortalFiles";
import PortalServices from "@/components/client-portal/PortalServices";
import PortalFinanceiro from "@/components/client-portal/PortalFinanceiro";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const portalUser = JSON.parse(localStorage.getItem("portalUser") || "{}");
  const clientId = portalUser?.client_id;

  // ============================
  // CLIENTE
  // ============================

  const { data: client } = useQuery({
    queryKey: ["portal-client", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;

      return data;
    },
  });

  // ============================
  // DEMANDAS
  // ============================

  const { data: demands = [] } = useQuery<any[]>({
    queryKey: ["portal-demands", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demands")
        .select("*")
        .eq("client_id", clientId)
        .order("delivery_date");

      if (error) throw error;

      return data ?? [];
    },
  });

  // ============================
  // EVENTOS
  // ============================

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["portal-events", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("client_id", clientId)
        .order("start_at");

      if (error) throw error;

      return data ?? [];
    },
  });

  // ============================
  // ARQUIVOS
  // ============================

  const { data: files = [] } = useQuery<any[]>({
    queryKey: ["portal-files", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_files")
        .select("*")
        .eq("client_id", clientId);

      if (error) throw error;

      return data ?? [];
    },
  });

  // ============================
  // SERVIÇOS
  // ============================

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["portal-services", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_services")
        .select(
          `
          *,
          services (
            name,
            description
          )
        `
        )
        .eq("client_id", clientId);

      if (error) throw error;

      return data ?? [];
    },
  });

  // ============================
  // FINANCEIRO
  // ============================

  const { data: finance = [] } = useQuery<any[]>({
    queryKey: ["portal-finance", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("client_id", clientId)
        .order("due_date");

      if (error) throw error;

      return data ?? [];
    },
  });

  // ============================
  // PROGRESSO
  // ============================

  const totalDemands = demands.length;

  const completedDemands = demands.filter((d) =>
    ["completed", "concluido", "concluído", "finalizado"].includes(
      d.status?.toLowerCase()
    )
  ).length;

  // ============================
  // LOADING
  // ============================

  if (!clientId) {
    return (
      <PortalLayout>
        <div className="p-10">
          Cliente não encontrado.
        </div>
      </PortalLayout>
    );
  }

  // ============================
  // DASHBOARD
  // ============================

  return (
    <PortalLayout>
      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name ?? "Cliente"}
        />

        <PortalStats
          demands={demands.length}
          files={files.length}
          events={events.length}
          services={services.length}
        />

        <PortalProgress
          total={totalDemands}
          completed={completedDemands}
        />

        <PortalFinanceiro
          invoices={finance}
        />

        <PortalServices
          services={services}
        />

        <PortalDemandsTable
          demands={demands}
        />

        <div className="grid gap-6 xl:grid-cols-2">

          <PortalEvents
            events={events}
          />

          <PortalFiles
            files={files}
          />

        </div>

      </div>
    </PortalLayout>
  );
}