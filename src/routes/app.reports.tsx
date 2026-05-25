import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/StatCard";
import { Download, TrendingUp, Users, Briefcase, ListChecks, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success("Exportado");
}

function ReportsPage() {
  const [period, setPeriod] = useState("month");

  const { data: clients = [] } = useQuery({ queryKey: ["r-clients"], queryFn: async () => (await supabase.from("clients").select("*")).data || [] });
  const { data: leads = [] } = useQuery({ queryKey: ["r-leads"], queryFn: async () => (await supabase.from("leads").select("*")).data || [] });
  const { data: demands = [] } = useQuery({ queryKey: ["r-demands"], queryFn: async () => (await supabase.from("demands").select("*")).data || [] });
  const { data: tx = [] } = useQuery({ queryKey: ["r-tx"], queryFn: async () => (await supabase.from("finance_transactions").select("*")).data || [] });
  const { data: services = [] } = useQuery({ queryKey: ["r-services"], queryFn: async () => (await supabase.from("services").select("*")).data || [] });
  const { data: goals = [] } = useQuery({ queryKey: ["r-goals"], queryFn: async () => (await supabase.from("goals").select("*")).data || [] });

  const stats = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "month") cutoff.setMonth(now.getMonth() - 1);
    else if (period === "quarter") cutoff.setMonth(now.getMonth() - 3);
    else cutoff.setFullYear(now.getFullYear() - 1);

    const inPeriod = (d: string | null) => d && new Date(d) >= cutoff;
    const revenue = tx.filter((t) => t.type === "receita" && t.status === "pago" && inPeriod(t.paid_date || t.due_date)).reduce((s, t) => s + Number(t.amount), 0);
    const expense = tx.filter((t) => t.type === "despesa" && t.status === "pago" && inPeriod(t.paid_date || t.due_date)).reduce((s, t) => s + Number(t.amount), 0);
    const newClients = clients.filter((c) => inPeriod(c.created_at)).length;
    const newLeads = leads.filter((l) => inPeriod(l.created_at)).length;
    const wonLeads = leads.filter((l) => l.status === "ganho").length;
    const conversionRate = leads.length > 0 ? (wonLeads / leads.length) * 100 : 0;
    const completedDemands = demands.filter((d) => d.status === "finalizado" && inPeriod(d.completed_at)).length;
    return { revenue, expense, profit: revenue - expense, newClients, newLeads, conversionRate, completedDemands };
  }, [tx, clients, leads, demands, period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics e exportações da operação</p>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="month">Último mês</TabsTrigger>
          <TabsTrigger value="quarter">Último trimestre</TabsTrigger>
          <TabsTrigger value="year">Último ano</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receita" value={fmt(stats.revenue)} icon={TrendingUp} accent="success" />
        <StatCard label="Lucro líquido" value={fmt(stats.profit)} icon={TrendingUp} accent={stats.profit >= 0 ? "success" : "destructive"} trend={`Despesas: ${fmt(stats.expense)}`} />
        <StatCard label="Novos clientes" value={stats.newClients} icon={Users} accent="primary" />
        <StatCard label="Conversão de leads" value={`${stats.conversionRate.toFixed(1)}%`} icon={Sparkles} accent="primary" trend={`${stats.newLeads} novos leads`} />
        <StatCard label="Demandas entregues" value={stats.completedDemands} icon={ListChecks} accent="success" />
        <StatCard label="Total de clientes" value={clients.length} icon={Users} />
        <StatCard label="Serviços ativos" value={services.filter((s) => s.active).length} icon={Briefcase} />
        <StatCard label="Metas em andamento" value={goals.filter((g) => g.status === "ativa").length} icon={Target} />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-1">Exportações CSV</h2>
        <p className="text-sm text-muted-foreground mb-4">Baixe os dados para análise em Excel ou Google Sheets.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => download(`clientes_${Date.now()}.csv`, toCSV(clients))}>
            <Download className="h-4 w-4 mr-2" /> Clientes ({clients.length})
          </Button>
          <Button variant="outline" onClick={() => download(`leads_${Date.now()}.csv`, toCSV(leads))}>
            <Download className="h-4 w-4 mr-2" /> Leads ({leads.length})
          </Button>
          <Button variant="outline" onClick={() => download(`demandas_${Date.now()}.csv`, toCSV(demands))}>
            <Download className="h-4 w-4 mr-2" /> Demandas ({demands.length})
          </Button>
          <Button variant="outline" onClick={() => download(`financeiro_${Date.now()}.csv`, toCSV(tx))}>
            <Download className="h-4 w-4 mr-2" /> Financeiro ({tx.length})
          </Button>
          <Button variant="outline" onClick={() => download(`servicos_${Date.now()}.csv`, toCSV(services))}>
            <Download className="h-4 w-4 mr-2" /> Serviços ({services.length})
          </Button>
          <Button variant="outline" onClick={() => download(`metas_${Date.now()}.csv`, toCSV(goals))}>
            <Download className="h-4 w-4 mr-2" /> Metas ({goals.length})
          </Button>
        </div>
      </Card>
    </div>
  );
}
