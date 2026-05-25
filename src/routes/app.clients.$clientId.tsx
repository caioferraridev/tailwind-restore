import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Archive, Trash2, Upload, Plus, Phone, Mail, MessageCircle, Pencil, Calendar as CalIcon, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/clients/$clientId")({
  component: ClientHubPage,
});

type Client = any;

function ClientHubPage() {
  const { clientId } = Route.useParams();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery<Client | null>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Carregando cliente...</div>;
  if (!client) return (
    <div className="p-8 space-y-4">
      <p className="text-sm text-muted-foreground">Cliente não encontrado.</p>
      <Button asChild variant="outline"><Link to="/app/clients"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link></Button>
    </div>
  );

  async function handleArchive() {
    const { error } = await supabase.from("clients").update({ archived: !client.archived }).eq("id", client.id);
    if (error) return toast.error(error.message);
    toast.success(client.archived ? "Cliente desarquivado" : "Cliente arquivado");
    qc.invalidateQueries({ queryKey: ["client", clientId] });
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  async function handleDelete() {
    const { error } = await supabase.from("clients").delete().eq("id", client.id);
    if (error) return toast.error(error.message);
    toast.success("Cliente excluído");
    qc.invalidateQueries({ queryKey: ["clients"] });
    navigate({ to: "/app/clients" });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/app/clients"><ArrowLeft className="h-4 w-4 mr-1" /> Clientes</Link>
      </Button>

      <ClientHeader client={client} companyId={profile?.company_id} onChange={() => qc.invalidateQueries({ queryKey: ["client", clientId] })} onArchive={handleArchive} onDelete={handleDelete} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="demands">Demandas</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="observations">Observações</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab clientId={clientId} client={client} /></TabsContent>
        <TabsContent value="history"><TimelineTab clientId={clientId} /></TabsContent>
        <TabsContent value="demands"><DemandsTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="calendar"><CalendarTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="payments"><PaymentsTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="services"><ServicesTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="observations"><ObservationsTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="activities"><ActivitiesTab clientId={clientId} /></TabsContent>
        <TabsContent value="files"><FilesTab clientId={clientId} companyId={profile?.company_id} /></TabsContent>
        <TabsContent value="reports"><ReportsTab clientId={clientId} client={client} /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- HEADER ---------------- */
function ClientHeader({ client, companyId, onChange, onArchive, onDelete }: any) {
  const [editOpen, setEditOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${companyId}/${client.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("client-logos").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("client-logos").getPublicUrl(path);
    const { error } = await supabase.from("clients").update({ logo_url: pub.publicUrl }).eq("id", client.id);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Logo atualizada");
    onChange();
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 rounded-xl border">
              <AvatarImage src={client.logo_url || undefined} className="object-cover" />
              <AvatarFallback className="rounded-xl text-xl">{client.company_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <button onClick={() => fileRef.current?.click()} className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
              <Upload className="h-4 w-4 mr-1" /> {uploading ? "..." : "Trocar"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogo} />
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.company_name}</h1>
            {client.trade_name && <p className="text-sm text-muted-foreground">{client.trade_name}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={client.status === "ativo" ? "default" : "secondary"} className="capitalize">{client.status}</Badge>
            <Badge variant="outline" className="capitalize">Prioridade: {client.priority}</Badge>
            {client.segment && <Badge variant="outline">{client.segment}</Badge>}
            {client.archived && <Badge variant="destructive">Arquivado</Badge>}
            {client.payment_status && <Badge variant="outline">Financeiro: {client.payment_status}</Badge>}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {client.contact_whatsapp && (
              <a href={`https://wa.me/${client.contact_whatsapp.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-1 hover:text-foreground">
                <MessageCircle className="h-4 w-4" /> {client.contact_whatsapp}
              </a>
            )}
            {client.contact_phone && (
              <a href={`tel:${client.contact_phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-4 w-4" /> {client.contact_phone}</a>
            )}
            {client.contact_email && (
              <a href={`mailto:${client.contact_email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="h-4 w-4" /> {client.contact_email}</a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 min-w-[180px]">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Mensalidade</div>
            <div className="text-2xl font-bold tabular-nums">R$ {Number(client.monthly_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            {client.due_day && <div className="text-xs text-muted-foreground">Vence dia {client.due_day}</div>}
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
            <Button variant="outline" size="sm" onClick={onArchive}><Archive className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>Todos os dados relacionados (demandas, eventos, observações, arquivos) serão removidos.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      {editOpen && <EditClientDialog client={client} onClose={() => setEditOpen(false)} onSaved={onChange} />}
    </Card>
  );
}

function EditClientDialog({ client, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({
    company_name: client.company_name || "",
    trade_name: client.trade_name || "",
    segment: client.segment || "",
    cnpj: client.cnpj || "",
    contact_name: client.contact_name || "",
    contact_email: client.contact_email || "",
    contact_phone: client.contact_phone || "",
    contact_whatsapp: client.contact_whatsapp || "",
    monthly_value: client.monthly_value || 0,
    due_day: client.due_day || "",
    payment_status: client.payment_status || "",
    status: client.status,
    priority: client.priority,
    internal_notes: client.internal_notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, monthly_value: Number(form.monthly_value || 0), due_day: form.due_day ? Number(form.due_day) : null };
    const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cliente atualizado");
    onSaved(); onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Empresa *</Label><Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
            <div><Label>Nome fantasia</Label><Input value={form.trade_name} onChange={(e) => set("trade_name", e.target.value)} /></div>
            <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></div>
            <div><Label>Segmento</Label><Input value={form.segment} onChange={(e) => set("segment", e.target.value)} /></div>
            <div><Label>Responsável</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></div>
            <div><Label>WhatsApp</Label><Input value={form.contact_whatsapp} onChange={(e) => set("contact_whatsapp", e.target.value)} /></div>
            <div><Label>Telefone</Label><Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></div>
            <div><Label>Mensalidade</Label><Input type="number" step="0.01" value={form.monthly_value} onChange={(e) => set("monthly_value", e.target.value)} /></div>
            <div><Label>Vencimento (dia)</Label><Input type="number" min="1" max="31" value={form.due_day} onChange={(e) => set("due_day", e.target.value)} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["ativo","inativo","pausado","arquivado"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["baixa","media","alta","urgente"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label>Status financeiro</Label><Input value={form.payment_status} onChange={(e) => set("payment_status", e.target.value)} placeholder="em dia, atrasado..." /></div>
            <div className="sm:col-span-2"><Label>Observações internas</Label><Textarea value={form.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving?"Salvando...":"Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewTab({ clientId, client }: any) {
  const { data } = useQuery({
    queryKey: ["client-overview", clientId],
    queryFn: async () => {
      const [tx, demands, events, obs] = await Promise.all([
        supabase.from("finance_transactions").select("amount,status,type").eq("client_id", clientId),
        supabase.from("demands").select("id,status").eq("client_id", clientId),
        supabase.from("calendar_events").select("id,start_at").eq("client_id", clientId).gte("start_at", new Date().toISOString()).order("start_at").limit(5),
        supabase.from("client_observations").select("id").eq("client_id", clientId),
      ]);
      const txs = tx.data || [];
      const paid = txs.filter((t: any) => t.status === "pago" && t.type === "receita").reduce((s: number, t: any) => s + Number(t.amount), 0);
      const pending = txs.filter((t: any) => t.status === "pendente").reduce((s: number, t: any) => s + Number(t.amount), 0);
      return {
        paid, pending,
        activeDemands: (demands.data || []).filter((d: any) => d.status !== "concluida" && d.status !== "cancelada").length,
        upcomingEvents: events.data || [],
        observationsCount: (obs.data || []).length,
      };
    },
  });

  const stats = [
    { label: "Total recebido", value: `R$ ${(data?.paid || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
    { label: "Pendente", value: `R$ ${(data?.pending || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
    { label: "Demandas ativas", value: data?.activeDemands ?? 0 },
    { label: "Observações", value: data?.observationsCount ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold mt-1 tabular-nums">{s.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><CalIcon className="h-4 w-4" /> Próximos eventos</h3>
        {(data?.upcomingEvents || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p>
        ) : (
          <ul className="space-y-2">
            {data!.upcomingEvents.map((e: any) => (
              <li key={e.id} className="text-sm flex justify-between border-b border-border pb-2 last:border-0">
                <span>{new Date(e.start_at).toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {client.internal_notes && (
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Notas internas</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.internal_notes}</p>
        </Card>
      )}
    </div>
  );
}

/* ---------------- TIMELINE / HISTORY ---------------- */
function TimelineTab({ clientId }: { clientId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["client-timeline", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .filter("details->>client_id", "eq", clientId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const labelMap: Record<string, string> = {
    demands: "Demanda", finance_transactions: "Pagamento",
    calendar_events: "Evento", client_observations: "Observação",
  };
  const actionMap: Record<string, string> = { created: "criada", updated: "atualizada", deleted: "removida" };

  return (
    <Card className="p-6">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem atividades registradas ainda.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((a: any) => (
            <li key={a.id} className="flex gap-3 border-l-2 border-primary/40 pl-4 py-1">
              <div className="flex-1">
                <div className="text-sm font-medium">{labelMap[a.entity_type] || a.entity_type} {actionMap[a.action] || a.action}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ---------------- DEMANDS ---------------- */
function DemandsTab({ clientId, companyId }: any) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["client-demands", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("demands").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova demanda</Button>
      </div>
      <Card>
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma demanda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-4 py-3">Nome</th><th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Prioridade</th><th className="text-left px-4 py-3">Entrega</th>
              <th className="text-right px-4 py-3">Valor</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>{data.map((d: any) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{d.status}</Badge></td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{d.priority}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.delivery_date || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">R$ {Number(d.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={async () => {
                  if (!confirm("Excluir demanda?")) return;
                  await supabase.from("demands").delete().eq("id", d.id);
                  qc.invalidateQueries({ queryKey: ["client-demands", clientId] });
                }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
      {open && <DemandDialog clientId={clientId} companyId={companyId} onClose={() => setOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["client-demands", clientId] })} />}
    </div>
  );
}

function DemandDialog({ clientId, companyId, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: "", description: "", status: "pendente", priority: "media", delivery_date: "", value: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from("demands").insert({
      ...form, company_id: companyId, client_id: clientId,
      delivery_date: form.delivery_date || null, value: form.value ? Number(form.value) : null,
    } as any);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Demanda criada"); onSaved(); onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent>
      <DialogHeader><DialogTitle>Nova demanda</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-3">
        <div><Label>Nome *</Label><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["pendente","em_andamento","em_revisao","concluida","cancelada"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prioridade</Label><Select value={form.priority} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["baixa","media","alta","urgente"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Entrega</Label><Input type="date" value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} /></div>
          <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>Salvar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

/* ---------------- CALENDAR ---------------- */
function CalendarTab({ clientId, companyId }: any) {
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["client-events", clientId, month.getFullYear(), month.getMonth()],
    queryFn: async () => {
      const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59).toISOString();
      const { data, error } = await supabase.from("calendar_events").select("*").eq("client_id", clientId).gte("start_at", start).lte("start_at", end).order("start_at");
      if (error) throw error; return data;
    },
  });

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1) as any);

  const eventsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    events.forEach((e: any) => {
      const d = new Date(e.start_at).getDate();
      (map[d] ||= []).push(e);
    });
    return map;
  }, [events]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</Button>
          <h3 className="font-semibold capitalize">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d} className="text-center font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => (
            <button key={i} disabled={!day} onClick={() => {
              if (!day) return;
              const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              setSelectedDay(iso);
            }} className={`min-h-[80px] p-2 text-left rounded-md border border-border text-xs hover:bg-accent ${!day ? "invisible" : ""}`}>
              <div className="font-semibold mb-1">{day}</div>
              <div className="space-y-0.5">
                {(eventsByDay[day as unknown as number] || []).slice(0, 3).map((e: any) => (
                  <div key={e.id} className="truncate bg-primary/10 text-primary px-1 rounded">{e.title}</div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>
      {selectedDay && (
        <DayEventsDialog day={selectedDay} clientId={clientId} companyId={companyId} events={events.filter((e: any) => e.start_at.startsWith(selectedDay))}
          onClose={() => setSelectedDay(null)} onChanged={() => qc.invalidateQueries({ queryKey: ["client-events", clientId] })} />
      )}
    </div>
  );
}

function DayEventsDialog({ day, clientId, companyId, events, onClose, onChanged }: any) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_type: "tarefa", start_time: "09:00", end_time: "10:00", priority: "media" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("calendar_events").insert({
      company_id: companyId, client_id: clientId, title: form.title, description: form.description,
      event_type: form.event_type as any, priority: form.priority as any,
      start_at: new Date(`${day}T${form.start_time}`).toISOString(),
      end_at: new Date(`${day}T${form.end_time}`).toISOString(),
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Evento criado");
    setForm({ title: "", description: "", event_type: "tarefa", start_time: "09:00", end_time: "10:00", priority: "media" });
    setCreating(false); onChanged();
  }

  async function del(id: string) {
    if (!confirm("Excluir evento?")) return;
    await supabase.from("calendar_events").delete().eq("id", id);
    onChanged();
  }

  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{new Date(day + "T12:00").toLocaleDateString("pt-BR", { dateStyle: "full" })}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between border border-border rounded-md p-3">
                <div>
                  <div className="font-medium text-sm">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {e.end_at && new Date(e.end_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                  {e.description && <div className="text-xs mt-1">{e.description}</div>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => del(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
        {creating ? (
          <form onSubmit={save} className="space-y-3 border-t pt-3">
            <div><Label>Título *</Label><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo</Label><Select value={form.event_type} onValueChange={(v) => set("event_type", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["tarefa","reuniao","entrega","postagem","campanha","evento"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Prioridade</Label><Select value={form.priority} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["baixa","media","alta","urgente"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Início</Label><Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} /></div>
              <div><Label>Fim</Label><Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button><Button type="submit">Adicionar</Button></div>
          </form>
        ) : (
          <Button onClick={() => setCreating(true)} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-1" /> Adicionar evento neste dia</Button>
        )}
      </div>
    </DialogContent></Dialog>
  );
}

/* ---------------- PAYMENTS ---------------- */
function PaymentsTab({ clientId, companyId }: any) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["client-payments", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_transactions").select("*").eq("client_id", clientId).order("due_date", { ascending: false });
      if (error) throw error; return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novo lançamento</Button></div>
      <Card>
        {data.length === 0 ? (<div className="p-8 text-center text-sm text-muted-foreground">Nenhum lançamento.</div>) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-4 py-3">Descrição</th><th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Vencimento</th>
              <th className="text-right px-4 py-3">Valor</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>{data.map((t: any) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3">{t.description}</td>
                <td className="px-4 py-3 capitalize">{t.type}</td>
                <td className="px-4 py-3"><Badge variant={t.status === "pago" ? "default" : t.status === "atrasado" ? "destructive" : "secondary"} className="capitalize">{t.status}</Badge></td>
                <td className="px-4 py-3">{t.due_date || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={async () => {
                  if (!confirm("Excluir lançamento?")) return;
                  await supabase.from("finance_transactions").delete().eq("id", t.id);
                  qc.invalidateQueries({ queryKey: ["client-payments", clientId] });
                }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
      {open && <PaymentDialog clientId={clientId} companyId={companyId} onClose={() => setOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["client-payments", clientId] })} />}
    </div>
  );
}

function PaymentDialog({ clientId, companyId, onClose, onSaved }: any) {
  const [form, setForm] = useState({ description: "", amount: "", type: "receita", status: "pendente", due_date: "", category: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("finance_transactions").insert({
      ...form, company_id: companyId, client_id: clientId,
      amount: Number(form.amount || 0), due_date: form.due_date || null,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Lançamento salvo"); onSaved(); onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent>
      <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-3">
        <div><Label>Descrição *</Label><Input required value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Valor</Label><Input type="number" step="0.01" required value={form.amount} onChange={(e) => set("amount", e.target.value)} /></div>
          <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></div>
          <div><Label>Tipo</Label><Select value={form.type} onValueChange={(v) => set("type", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent></Select></div>
          <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["pendente","pago","atrasado","cancelado"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="col-span-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

/* ---------------- SERVICES ---------------- */
function ServicesTab({ clientId, companyId }: any) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["client-services", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_services").select("*, services(name, category)").eq("client_id", clientId);
      if (error) throw error; return data;
    },
  });
  const { data: allServices = [] } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => (await supabase.from("services").select("id,name").eq("active", true)).data || [],
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Adicionar serviço</Button></div>
      <Card>
        {data.length === 0 ? (<div className="p-8 text-center text-sm text-muted-foreground">Nenhum serviço contratado.</div>) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-4 py-3">Serviço</th><th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Início</th><th className="text-right px-4 py-3">Mensal</th><th></th>
            </tr></thead>
            <tbody>{data.map((s: any) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.services?.name || "—"}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{s.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{s.start_date || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">R$ {Number(s.monthly_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={async () => {
                  await supabase.from("client_services").delete().eq("id", s.id);
                  qc.invalidateQueries({ queryKey: ["client-services", clientId] });
                }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
      {open && (
        <ClientServiceDialog companyId={companyId} clientId={clientId} services={allServices} onClose={() => setOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["client-services", clientId] })} />
      )}
    </div>
  );
}

function ClientServiceDialog({ companyId, clientId, services, onClose, onSaved }: any) {
  const [form, setForm] = useState({ service_id: "", monthly_value: "", start_date: "", status: "ativo", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.service_id) return toast.error("Escolha um serviço");
    const { error } = await supabase.from("client_services").insert({
      ...form, company_id: companyId, client_id: clientId,
      monthly_value: Number(form.monthly_value || 0), start_date: form.start_date || null,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Serviço vinculado"); onSaved(); onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent>
      <DialogHeader><DialogTitle>Adicionar serviço contratado</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-3">
        <div><Label>Serviço</Label>
          <Select value={form.service_id} onValueChange={(v) => set("service_id", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{services.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Valor mensal</Label><Input type="number" step="0.01" value={form.monthly_value} onChange={(e) => set("monthly_value", e.target.value)} /></div>
          <div><Label>Início</Label><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></div>
        </div>
        <div><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

/* ---------------- OBSERVATIONS ---------------- */
function ObservationsTab({ clientId, companyId }: any) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("all");
  const { data = [] } = useQuery({
    queryKey: ["client-obs", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_observations").select("*").eq("client_id", clientId).order("observation_date", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const filtered = data.filter((o: any) =>
    (category === "all" || o.category === category) &&
    o.content.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input placeholder="Buscar observações..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {["geral","comercial","operacional","financeiro","estrategico"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Nova observação</Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Nenhuma observação.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <Badge variant="outline" className="capitalize">{o.category}</Badge>
                    <Badge variant="secondary" className="capitalize">{o.priority}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(o.observation_date + "T12:00").toLocaleDateString("pt-BR")} • {new Date(o.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{o.content}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(o); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={async () => {
                    if (!confirm("Excluir observação?")) return;
                    await supabase.from("client_observations").delete().eq("id", o.id);
                    qc.invalidateQueries({ queryKey: ["client-obs", clientId] });
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && <ObservationDialog clientId={clientId} companyId={companyId} authorId={profile?.id} editing={editing}
        onClose={() => setOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["client-obs", clientId] })} />}
    </div>
  );
}

function ObservationDialog({ clientId, companyId, authorId, editing, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    content: editing?.content || "",
    category: editing?.category || "geral",
    priority: editing?.priority || "media",
    observation_date: editing?.observation_date || new Date().toISOString().slice(0, 10),
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from("client_observations").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Observação atualizada");
    } else {
      const { error } = await supabase.from("client_observations").insert({
        ...form, company_id: companyId, client_id: clientId, author_id: authorId,
      } as any);
      if (error) return toast.error(error.message);
      toast.success("Observação criada");
    }
    onSaved(); onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} observação</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-3">
        <div><Label>Conteúdo *</Label><Textarea required rows={5} value={form.content} onChange={(e) => set("content", e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Data</Label><Input type="date" value={form.observation_date} onChange={(e) => set("observation_date", e.target.value)} /></div>
          <div><Label>Categoria</Label><Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["geral","comercial","operacional","financeiro","estrategico"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prioridade</Label><Select value={form.priority} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["baixa","media","alta","urgente"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

/* ---------------- ACTIVITIES ---------------- */
function ActivitiesTab({ clientId }: any) {
  return <TimelineTab clientId={clientId} />;
}

/* ---------------- FILES ---------------- */
function FilesTab({ clientId, companyId }: any) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["client-files", clientId],
    queryFn: async () => (await supabase.from("client_files").select("*").eq("client_id", clientId).order("created_at", { ascending: false })).data || [],
  });

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploading(true);
    const path = `${companyId}/${clientId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("client-files").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("client_files").insert({
      company_id: companyId, client_id: clientId, uploaded_by: profile?.id,
      file_name: file.name, file_path: path, file_size: file.size, mime_type: file.type,
    } as any);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Arquivo enviado");
    qc.invalidateQueries({ queryKey: ["client-files", clientId] });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function download(f: any) {
    const { data, error } = await supabase.storage.from("client-files").createSignedUrl(f.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  async function del(f: any) {
    if (!confirm("Excluir arquivo?")) return;
    await supabase.storage.from("client-files").remove([f.file_path]);
    await supabase.from("client_files").delete().eq("id", f.id);
    qc.invalidateQueries({ queryKey: ["client-files", clientId] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input ref={fileRef} type="file" hidden onChange={upload} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-4 w-4 mr-1" /> {uploading ? "Enviando..." : "Enviar arquivo"}</Button>
      </div>
      {data.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Nenhum arquivo enviado.</Card>
      ) : (
        <Card>
          <ul>
            {data.map((f: any) => (
              <li key={f.id} className="flex items-center justify-between border-b border-border last:border-0 p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{f.file_name}</div>
                    <div className="text-xs text-muted-foreground">{(f.file_size / 1024).toFixed(1)} KB • {new Date(f.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => download(f)}><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(f)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ---------------- REPORTS ---------------- */
function ReportsTab({ clientId, client }: any) {
  async function exportCSV() {
    const [demands, payments, obs, events] = await Promise.all([
      supabase.from("demands").select("*").eq("client_id", clientId),
      supabase.from("finance_transactions").select("*").eq("client_id", clientId),
      supabase.from("client_observations").select("*").eq("client_id", clientId),
      supabase.from("calendar_events").select("*").eq("client_id", clientId),
    ]);
    const rows: string[] = [`Relatório - ${client.company_name}`, ""];
    rows.push("== DEMANDAS =="); rows.push("nome,status,prioridade,entrega,valor");
    (demands.data || []).forEach((d: any) => rows.push(`"${d.name}",${d.status},${d.priority},${d.delivery_date || ""},${d.value || 0}`));
    rows.push(""); rows.push("== PAGAMENTOS =="); rows.push("descricao,tipo,status,vencimento,valor");
    (payments.data || []).forEach((t: any) => rows.push(`"${t.description}",${t.type},${t.status},${t.due_date || ""},${t.amount}`));
    rows.push(""); rows.push("== OBSERVAÇÕES =="); rows.push("data,categoria,prioridade,conteudo");
    (obs.data || []).forEach((o: any) => rows.push(`${o.observation_date},${o.category},${o.priority},"${o.content.replace(/"/g, '""')}"`));
    rows.push(""); rows.push("== EVENTOS =="); rows.push("titulo,tipo,inicio,fim");
    (events.data || []).forEach((e: any) => rows.push(`"${e.title}",${e.event_type},${e.start_at},${e.end_at || ""}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cliente-${client.company_name}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-2">Relatório consolidado</h3>
      <p className="text-sm text-muted-foreground mb-4">Exporte todos os dados do cliente em CSV (demandas, pagamentos, observações e eventos).</p>
      <Button onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Exportar CSV</Button>
    </Card>
  );
}
