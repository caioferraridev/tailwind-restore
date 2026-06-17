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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/leads")({ component: LeadsPage });

const STAGES = [
  { id: "novo", label: "Novo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  { id: "contato", label: "Em contato", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { id: "qualificado", label: "Qualificado", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  { id: "proposta", label: "Proposta", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { id: "negociacao", label: "Negociação", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  { id: "ganho", label: "Ganho", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { id: "perdido", label: "Perdido", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
] as const;

function LeadsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function moveStage(id: string, status: string) {
    const { error } = await supabase.from("leads").update({ status: status as never }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["leads"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  }

  const totalValue = leads.reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);
  const wonValue = leads.filter(l => l.status === "ganho").reduce((s, l) => s + Number(l.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads / Prospecções</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leads.length} leads · Pipeline: R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · Ganhos: R$ {wonValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo lead</Button>
          </DialogTrigger>
          <LeadFormDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.status === stage.id);
            const stageValue = items.reduce((s, l) => s + Number(l.estimated_value || 0), 0);
            return (
              <div key={stage.id} className="space-y-2">
                <div className="px-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    {stage.label} <span className="text-foreground/60">({items.length})</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">R$ {stageValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</div>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {items.map((lead) => (
                    <Card key={lead.id} className="p-3 space-y-2 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{lead.name}</div>
                          {lead.company_name && <div className="text-xs text-muted-foreground truncate">{lead.company_name}</div>}
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => remove(lead.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      {Number(lead.estimated_value) > 0 && (
                        <div className="text-xs font-semibold text-primary">
                          R$ {Number(lead.estimated_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      <div className="flex items-center gap-1 flex-wrap">
                        {lead.source && <Badge variant="outline" className="text-[10px] py-0">{lead.source}</Badge>}
                        <Badge className={`text-[10px] py-0 ${stage.color}`} variant="outline">{lead.priority}</Badge>
                      </div>
                      <Select value={lead.status} onValueChange={(v) => moveStage(lead.id, v)}>
                        <SelectTrigger className="h-7 text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeadFormDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", company_name: "", email: "", phone: "", whatsapp: "",
    source: "", segment: "", estimated_value: "", status: "novo",
    priority: "medium", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      ...form,
      company_id: companyId,
      status: form.status as never,
      priority: form.priority as never,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Lead criado!");
    qc.invalidateQueries({ queryKey: ["leads"] });
    onClose();
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2"><Label>Nome *</Label>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Empresa</Label>
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Segmento</Label>
            <Input value={form.segment} onChange={(e) => set("segment", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Origem</Label>
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Indicação", "Instagram", "Site", "LinkedIn", "WhatsApp", "Evento", "Outro"].map(s =>
                  <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Valor estimado (R$)</Label>
            <Input type="number" step="0.01" value={form.estimated_value} onChange={(e) => set("estimated_value", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Etapa</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar lead"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Re-export ComingSoon for backwards compat (used by other placeholder routes — no longer needed but safe)
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return <div><h1 className="text-3xl font-bold">{title}</h1><p className="text-muted-foreground">{description}</p></div>;
}
