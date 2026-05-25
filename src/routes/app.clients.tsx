import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = clients.filter((c) =>
    [c.company_name, c.trade_name, c.segment, c.contact_name]
      .filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente excluído");
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo cliente</Button>
          </DialogTrigger>
          <ClientFormDialog companyId={profile?.company_id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Empresa</th>
                <th className="text-left px-4 py-3 font-medium">Segmento</th>
                <th className="text-left px-4 py-3 font-medium">Contato</th>
                <th className="text-right px-4 py-3 font-medium">Mensalidade</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate({ to: "/app/clients/$clientId", params: { clientId: c.id } })}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md">
                        <AvatarImage src={(c as any).logo_url || undefined} className="object-cover" />
                        <AvatarFallback className="rounded-md text-xs">{c.company_name?.slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{c.company_name}</div>
                        {c.trade_name && <div className="text-xs text-muted-foreground">{c.trade_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.segment || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.contact_name || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    R$ {Number(c.monthly_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "ativo" ? "default" : "secondary"} className="capitalize">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function ClientFormDialog({ companyId, onClose }: { companyId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    company_name: "", trade_name: "", cnpj: "", segment: "", website: "",
    contact_name: "", contact_email: "", contact_whatsapp: "",
    monthly_value: "", status: "ativo" as const, internal_notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      ...form,
      company_id: companyId,
      monthly_value: form.monthly_value ? Number(form.monthly_value) : 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cliente cadastrado!");
    qc.invalidateQueries({ queryKey: ["clients"] });
    onClose();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome da empresa *</Label>
            <Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label>Nome fantasia</Label>
            <Input value={form.trade_name} onChange={(e) => set("trade_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CNPJ</Label>
            <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Segmento</Label>
            <Input value={form.segment} onChange={(e) => set("segment", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Site</Label>
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Responsável</Label>
            <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>WhatsApp</Label>
            <Input value={form.contact_whatsapp} onChange={(e) => set("contact_whatsapp", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Email</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Mensalidade (R$)</Label>
            <Input type="number" step="0.01" value={form.monthly_value} onChange={(e) => set("monthly_value", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Observações</Label>
            <Textarea value={form.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
