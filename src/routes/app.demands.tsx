import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/demands")({
  component: DemandsPage,
});

const STATUSES = [
  { value: "pending", label: "Pendente", color: "bg-muted text-muted-foreground" },
  { value: "in_progress", label: "Em andamento", color: "bg-primary/15 text-primary" },
  { value: "waiting_for_client", label: "Aguardando cliente", color: "bg-warning/20 text-warning-foreground" },
  { value: "em_revisao", label: "Em revisão", color: "bg-accent text-accent-foreground" },
  { value: "completed", label: "Finalizado", color: "bg-success/15 text-success" },
  { value: "delayed", label: "Atrasado", color: "bg-destructive/15 text-destructive" },
] as const;

function DemandsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: demands = [] } = useQuery({
    queryKey: ["demands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demands")
        .select("*, clients(company_name, contact_whatsapp)")
        .order("delivery_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  async function updateStatus(id: string, status: string) {
    const updates: any = { status };
    if (status === "finalizado") updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from("demands").update(updates).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    qc.invalidateQueries({ queryKey: ["demands"] });
  }

  function openWhatsApp(d: any) {
    const phone = d.clients?.contact_whatsapp?.replace(/\D/g, "");
    if (!phone) return toast.error("Cliente sem WhatsApp cadastrado");
    const msg = `Olá! Sua demanda *${d.name}* foi finalizada. ✅`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // Group by status (Kanban)
  const byStatus = STATUSES.map((s) => ({
    ...s,
    items: demands.filter((d) => d.status === s.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demandas</h1>
          <p className="text-sm text-muted-foreground mt-1">Quadro Kanban de entregas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nova demanda</Button></DialogTrigger>
          <DemandFormDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {byStatus.map((col) => (
          <div key={col.value} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${col.color}`}>{col.label}</span>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {col.items.map((d: any) => (
                <Card key={d.id} className="p-3 hover:shadow-[var(--shadow-elegant)] transition-shadow">
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{d.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{d.clients?.company_name || "—"}</p>
                  {d.delivery_date && (
                    <p className="text-xs text-muted-foreground mb-2">
                      📅 {new Date(d.delivery_date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  <div className="flex gap-1">
                    <Select value={d.status} onValueChange={(v) => updateStatus(d.id, v)}>
                      <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {d.status === "finalizado" && (
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openWhatsApp(d)}>
                        <MessageCircle className="h-3.5 w-3.5 text-success" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemandFormDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", description: "", client_id: "", service_id: "",
    delivery_date: "", priority: "media" as const, value: "",
    assigned_to: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => (await supabase.from("clients").select("id, company_name").order("company_name")).data || [],
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => (await supabase.from("services").select("id, name").order("name")).data || [],
  });
  const { data: team = [] } = useQuery({
    queryKey: ["team-list", companyId],
    enabled: !!companyId,
    queryFn: async () => (await supabase.from("profiles").select("id, full_name, email").eq("company_id", companyId!)).data || [],
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("demands").insert({
      company_id: companyId,
      name: form.name,
      description: form.description || null,
      client_id: form.client_id || null,
      service_id: form.service_id || null,
      delivery_date: form.delivery_date || null,
      priority: form.priority,
      value: form.value ? Number(form.value) : null,
      assigned_to: form.assigned_to || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Demanda criada!");
    qc.invalidateQueries({ queryKey: ["demands"] });
    onClose();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova Demanda</DialogTitle></DialogHeader>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5"><Label>Nome *</Label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Cliente</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Serviço</Label>
            <Select value={form.service_id} onValueChange={(v) => set("service_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{services.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Data de entrega</Label>
            <Input type="date" value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Valor (R$)</Label>
            <Input type="number" step="0.01" value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Responsável</Label>
            <Select value={form.assigned_to} onValueChange={(v) => set("assigned_to", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{team.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
            </Select></div>
        </div>
        <div className="space-y-1.5"><Label>Descrição</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
