import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/StatCard";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/finance")({ component: FinancePage });

const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function FinancePage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const { data: tx = [], isLoading } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_transactions").select("*").order("due_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthTx = tx.filter((t) => {
      const d = t.due_date ? new Date(t.due_date) : null;
      return d && d.getMonth() === month && d.getFullYear() === year;
    });
    const revenue = monthTx.filter((t) => t.type === "receita" && t.status === "pago").reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthTx.filter((t) => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + Number(t.amount), 0);
    const pending = tx.filter((t) => t.status === "pendente" && t.type === "receita").reduce((s, t) => s + Number(t.amount), 0);
    const overdue = tx.filter((t) => {
      const d = t.due_date ? new Date(t.due_date) : null;
      return t.status === "pendente" && t.type === "receita" && d && d < now;
    }).reduce((s, t) => s + Number(t.amount), 0);
    return { revenue, expense, profit: revenue - expense, pending, overdue };
  }, [tx]);

  const filtered = tab === "all" ? tx : tx.filter((t) => t.type === tab || t.status === tab);

  async function setStatus(id: string, status: string) {
    await supabase.from("finance_transactions").update({
      status: status as never,
      paid_date: status === "pago" ? new Date().toISOString().slice(0, 10) : null,
    }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["finance"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir lançamento?")) return;
    await supabase.from("finance_transactions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["finance"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Receitas, despesas e fluxo de caixa</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Novo lançamento</Button></DialogTrigger>
          <TxDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receita do mês" value={fmt(stats.revenue)} icon={TrendingUp} accent="success" />
        <StatCard label="Despesas do mês" value={fmt(stats.expense)} icon={TrendingDown} accent="destructive" />
        <StatCard label="Lucro líquido" value={fmt(stats.profit)} icon={Wallet} accent={stats.profit >= 0 ? "success" : "destructive"} />
        <StatCard label="A receber / atrasado" value={fmt(stats.pending)} trend={stats.overdue > 0 ? `Atrasado: ${fmt(stats.overdue)}` : undefined} icon={AlertCircle} accent="warning" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="receita">Receitas</TabsTrigger>
          <TabsTrigger value="despesa">Despesas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <Card className="overflow-hidden">
            {isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
            : filtered.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">Nenhum lançamento.</div>
            : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Descrição</th>
                    <th className="text-left px-4 py-3 font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium">Vencimento</th>
                    <th className="text-right px-4 py-3 font-medium">Valor</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{t.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.category || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR") : "—"}</td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${t.type === "receita" ? "text-success" : "text-destructive"}`}>
                        {t.type === "receita" ? "+" : "−"} {fmt(Number(t.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={t.status === "pago" ? "default" : t.status === "atrasado" ? "destructive" : "secondary"} className="capitalize">{t.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {t.status !== "pago" && (
                          <Button size="icon" variant="ghost" onClick={() => setStatus(t.id, "pago")} title="Marcar pago">
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => remove(t.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TxDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: "receita", description: "", category: "", amount: "",
    due_date: new Date().toISOString().slice(0, 10), status: "pendente",
    payment_method: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("finance_transactions").insert({
      ...form,
      company_id: companyId,
      type: form.type as never,
      status: form.status as never,
      amount: Number(form.amount || 0),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
  toast.success("Lançamento criado!");

  onClose();

  setTimeout(() => {
  qc.invalidateQueries({ queryKey: ["finance"] });
  }, 100);
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Tipo *</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Descrição *</Label>
            <Input required value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Categoria</Label>
            <Input placeholder="Ex: Mensalidade, Software, Tráfego" value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Valor (R$) *</Label>
            <Input required type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Vencimento</Label>
            <Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Método</Label>
            <Input placeholder="PIX, Boleto, Cartão" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
