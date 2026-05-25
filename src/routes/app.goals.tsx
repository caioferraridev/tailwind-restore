import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/goals")({ component: GoalsPage });

function GoalsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*").order("period_end", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  async function updateProgress(id: string, value: number) {
    await supabase.from("goals").update({ current_value: value }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir meta?")) return;
    await supabase.from("goals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground mt-1">{goals.length} meta(s) ativa(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nova meta</Button></DialogTrigger>
          <GoalDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      {isLoading ? <div className="text-sm text-muted-foreground">Carregando...</div>
      : goals.length === 0 ? (
        <Card className="p-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-1">Nenhuma meta criada</h2>
          <p className="text-sm text-muted-foreground">Defina objetivos mensais ou trimestrais para sua equipe.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = g.target_value > 0 ? Math.min(100, (Number(g.current_value) / Number(g.target_value)) * 100) : 0;
            const overdue = new Date(g.period_end) < new Date() && pct < 100;
            return (
              <Card key={g.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold">{g.title}</div>
                    {g.description && <div className="text-xs text-muted-foreground mt-0.5">{g.description}</div>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(g.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{g.metric}</Badge>
                  <span>{new Date(g.period_start).toLocaleDateString("pt-BR")} → {new Date(g.period_end).toLocaleDateString("pt-BR")}</span>
                  {overdue && <Badge variant="destructive" className="ml-auto">Atrasada</Badge>}
                  {pct >= 100 && <Badge className="bg-success text-success-foreground ml-auto">Concluída</Badge>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">{Number(g.current_value).toLocaleString("pt-BR")} / {Number(g.target_value).toLocaleString("pt-BR")}</span>
                    <span className="font-semibold">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number" step="0.01" placeholder="Atualizar progresso"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = Number((e.target as HTMLInputElement).value);
                        if (!isNaN(v)) {
                          updateProgress(g.id, v);
                          (e.target as HTMLInputElement).value = "";
                          toast.success("Progresso atualizado");
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const today = new Date();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [form, setForm] = useState({
    title: "", description: "", metric: "revenue",
    target_value: "", current_value: "0",
    period_start: today.toISOString().slice(0, 10),
    period_end: monthEnd.toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("goals").insert({
      ...form, company_id: companyId,
      target_value: Number(form.target_value || 0),
      current_value: Number(form.current_value || 0),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Meta criada!");
    qc.invalidateQueries({ queryKey: ["goals"] });
    onClose();
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova Meta</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-1.5"><Label>Título *</Label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Descrição</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Métrica</Label>
            <Select value={form.metric} onValueChange={(v) => set("metric", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Receita (R$)</SelectItem>
                <SelectItem value="clients">Novos clientes</SelectItem>
                <SelectItem value="leads">Leads gerados</SelectItem>
                <SelectItem value="demands">Demandas entregues</SelectItem>
                <SelectItem value="custom">Outro</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Meta *</Label>
            <Input required type="number" step="0.01" value={form.target_value} onChange={(e) => set("target_value", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Início</Label>
            <Input type="date" value={form.period_start} onChange={(e) => set("period_start", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Fim</Label>
            <Input type="date" value={form.period_end} onChange={(e) => set("period_end", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
