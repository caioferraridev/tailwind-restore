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
import { Plus, Trash2, Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/services")({
  component: ServicesPage,
});

const CATEGORIES = ["Social Media", "Tráfego Pago", "Design", "Branding", "Site", "SEO", "Consultoria", "Filmagem", "Fotografia"];

function ServicesPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function handleDelete(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Serviço excluído");
    qc.invalidateQueries({ queryKey: ["services"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">Catálogo de serviços oferecidos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Novo serviço</Button></DialogTrigger>
          <ServiceFormDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 && (
          <Card className="p-12 text-center sm:col-span-2 lg:col-span-3">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
          </Card>
        )}
        {services.map((s) => (
          <Card key={s.id} className="p-5 hover:shadow-[var(--shadow-elegant)] transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                {s.category && <Badge variant="secondary" className="mt-1">{s.category}</Badge>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {s.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}
            <div className="text-lg font-bold text-primary">
              R$ {Number(s.default_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServiceFormDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", category: "", description: "", default_value: "", estimated_time: "", priority: "media" as const });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("services").insert({
      ...form,
      company_id: companyId,
      default_value: form.default_value ? Number(form.default_value) : 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Serviço cadastrado!");
    qc.invalidateQueries({ queryKey: ["services"] });
    onClose();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Novo Serviço</DialogTitle></DialogHeader>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5"><Label>Nome *</Label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1.5"><Label>Valor padrão (R$)</Label>
            <Input type="number" step="0.01" value={form.default_value} onChange={(e) => set("default_value", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Tempo estimado</Label>
            <Input value={form.estimated_time} onChange={(e) => set("estimated_time", e.target.value)} placeholder="Ex: 5 dias" /></div>
          <div className="space-y-1.5"><Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
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
