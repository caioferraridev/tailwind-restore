import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, ListChecks, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", profile?.company_id],
    enabled: !!profile?.company_id,
    queryFn: async () => {
      const [clients, services, demands, events] = await Promise.all([
        supabase.from("clients").select("id, monthly_value, status", { count: "exact" }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("demands").select("id, status, delivery_date"),
        supabase.from("calendar_events").select("id, start_at").gte("start_at", new Date().toISOString()).limit(5),
      ]);
      const activeClients = (clients.data || []).filter((c) => c.status === "ativo");
      const monthlyRevenue = activeClients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0);
      const pendingDemands = (demands.data || []).filter((d) => d.status === "pendente" || d.status === "em_andamento").length;
      const lateDemands = (demands.data || []).filter((d) => d.delivery_date && new Date(d.delivery_date) < new Date() && d.status !== "finalizado").length;
      return {
        totalClients: activeClients.length,
        totalServices: services.count || 0,
        monthlyRevenue,
        pendingDemands,
        lateDemands,
        upcomingEvents: events.data?.length || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da sua agência</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Clientes Ativos" value={stats?.totalClients ?? 0} icon={Users} />
        <StatCard label="Faturamento Mensal" value={`R$ ${(stats?.monthlyRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={DollarSign} accent="success" />
        <StatCard label="Serviços" value={stats?.totalServices ?? 0} icon={Briefcase} />
        <StatCard label="Demandas Pendentes" value={stats?.pendingDemands ?? 0} icon={ListChecks} accent="warning" />
        <StatCard label="Demandas Atrasadas" value={stats?.lateDemands ?? 0} icon={AlertCircle} accent="destructive" />
        <StatCard label="Próximos Eventos" value={stats?.upcomingEvents ?? 0} icon={Calendar} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h2 className="font-semibold mb-1">Próximas entregas</h2>
          <p className="text-sm text-muted-foreground mb-4">Demandas com prazo nos próximos dias</p>
          <UpcomingDemands />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-1">Últimos clientes</h2>
          <p className="text-sm text-muted-foreground mb-4">Cadastros recentes</p>
          <RecentClients />
        </Card>
      </div>
    </div>
  );
}

function UpcomingDemands() {
  const { data } = useQuery({
    queryKey: ["upcoming-demands"],
    queryFn: async () => {
      const { data } = await supabase
        .from("demands")
        .select("id, name, delivery_date, status, clients(company_name)")
        .neq("status", "finalizado")
        .order("delivery_date", { ascending: true, nullsFirst: false })
        .limit(5);
      return data || [];
    },
  });
  if (!data?.length) return <p className="text-sm text-muted-foreground">Nenhuma demanda pendente.</p>;
  return (
    <ul className="space-y-2.5">
      {data.map((d: any) => (
        <li key={d.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
          <div className="min-w-0">
            <p className="font-medium truncate">{d.name}</p>
            <p className="text-xs text-muted-foreground">{d.clients?.company_name || "—"}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 ml-3">
            {d.delivery_date ? new Date(d.delivery_date).toLocaleDateString("pt-BR") : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RecentClients() {
  const { data } = useQuery({
    queryKey: ["recent-clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, company_name, segment, status")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });
  if (!data?.length) return <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>;
  return (
    <ul className="space-y-2.5">
      {data.map((c) => (
        <li key={c.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
          <div className="min-w-0">
            <p className="font-medium truncate">{c.company_name}</p>
            <p className="text-xs text-muted-foreground">{c.segment || "—"}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 ml-3 capitalize">{c.status}</span>
        </li>
      ))}
    </ul>
  );
}
