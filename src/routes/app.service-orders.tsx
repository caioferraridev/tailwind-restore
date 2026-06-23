import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Eye, Pencil, Trash2, FileText, Image as ImageIcon, ListChecks,
  PenLine, Printer, Wrench, Calendar as CalendarIcon, DollarSign, Hash,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/service-orders")({
  component: ServiceOrdersPage,
});

// ---------- helpers ----------

type OSStatus = "pendente" | "em_andamento" | "aguardando_cliente" | "finalizado" | "em_revisao";

const STATUS_META: Record<OSStatus, { label: string; cls: string }> = {
  pendente: { label: "Aberta", cls: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em andamento", cls: "bg-primary/15 text-primary" },
  aguardando_cliente: { label: "Aguardando cliente", cls: "bg-warning/20 text-warning-foreground" },
  finalizado: { label: "Concluída", cls: "bg-success/15 text-success" },
  em_revisao: { label: "Cancelada", cls: "bg-destructive/15 text-destructive" },
};

type OSItem = { id: string; description: string; quantity: number; unit_price: number };
type OSPhoto = { id: string; url: string; path: string };
type OSMeta = {
  _os: true;
  equipment?: string;
  serial_number?: string;
  observations?: string;
  items?: OSItem[];
  photos?: OSPhoto[];
  signature_url?: string;
  pdf_url?: string;
};

function parseMeta(notes: string | null): OSMeta {
  if (!notes) return { _os: true };
  try {
    const obj = JSON.parse(notes);
    if (obj && obj._os) return obj;
  } catch {
    // fallthrough — legacy plain-text notes
  }
  return { _os: true, observations: notes };
}

function isOS(notes: string | null) {
  if (!notes) return false;
  try {
    const o = JSON.parse(notes);
    return !!(o && o._os);
  } catch {
    return false;
  }
}

function osNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function brl(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function itemsTotal(items: OSItem[] = []) {
  return items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);
}

// ---------- page ----------

function ServiceOrdersPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["service-orders", profile?.company_id],
    enabled: !!profile?.company_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, clients!client_id(company_name, contact_whatsapp)")
        .eq("company_id", profile!.company_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).filter((d: any) => isOS(d.notes));
    },
  });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((r: any) => r.status === statusFilter);
  }, [rows, statusFilter]);

  async function remove(id: string) {
    if (!confirm("Excluir esta Ordem de Serviço?")) return;
    const { error } = await supabase.from("service_orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("OS excluída");
    qc.invalidateQueries({ queryKey: ["service-orders"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie ordens vinculadas aos seus clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {(Object.keys(STATUS_META) as OSStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Nova Ordem de Serviço</Button>
            </DialogTrigger>
            <OSFormDialog
              companyId={profile?.company_id}
              onClose={() => setCreateOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Wrench className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma ordem de serviço encontrada.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d: any) => {
            const meta = parseMeta(d.notes);
            const status = (d.status as OSStatus) || "pendente";
            const sm = STATUS_META[status] || STATUS_META.pendente;
            return (
              <Card
                key={d.id}
                className="p-5 hover:shadow-[var(--shadow-elegant)] transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Hash className="h-3 w-3" /> {osNumber(d.id)}
                    </div>
                    <h3 className="font-semibold text-base mt-0.5 truncate">{d.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.clients?.company_name || "Sem cliente"}
                    </p>
                  </div>
                  <Badge className={sm.cls} variant="secondary">{sm.label}</Badge>
                </div>

                {meta.equipment && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wrench className="h-3 w-3" /> {meta.equipment}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {d.delivery_date
                      ? new Date(d.delivery_date).toLocaleDateString("pt-BR")
                      : "Sem data"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <DollarSign className="h-3 w-3" />
                    {brl(Number(d.value || 0) + itemsTotal(meta.items))}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => setViewId(d.id)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Visualizar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => setEditId(d.id)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="icon"
                    onClick={() => remove(d.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* View */}
      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        {viewId && <OSViewDialog id={viewId} onClose={() => setViewId(null)} />}
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        {editId && (
          <OSFormDialog
            companyId={profile?.company_id}
            editId={editId}
            onClose={() => setEditId(null)}
          />
        )}
      </Dialog>
    </div>
  );
}

// ---------- form (create + edit) ----------

function OSFormDialog({
  companyId, onClose, editId,
}: { companyId?: string; onClose: () => void; editId?: string }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", client_id: "",
    delivery_date: "", value: "",
    status: "pendente" as OSStatus,
    equipment: "", serial_number: "", observations: "",
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () =>
      (await supabase.from("clients").select("id, company_name").order("company_name")).data || [],
  });

  // Load when editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data, error } = await supabase.from("service_orders").select("*").eq("id", editId).single();
      if (error || !data) return;
      const meta = parseMeta(data.notes);
      setForm({
        name: data.name || "",
        description: data.description || "",
        client_id: data.client_id || "",
        delivery_date: data.delivery_date || "",
        value: data.value != null ? String(data.value) : "",
        status: (data.status as OSStatus) || "pendente",
        equipment: meta.equipment || "",
        serial_number: meta.serial_number || "",
        observations: meta.observations || "",
      });
    })();
  }, [editId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);

    let meta: OSMeta;
    if (editId) {
      const { data } = await supabase.from("service_orders").select("notes").eq("id", editId).single();
      meta = parseMeta(data?.notes ?? null);
    } else {
      meta = { _os: true };
    }
    meta.equipment = form.equipment || undefined;
    meta.serial_number = form.serial_number || undefined;
    meta.observations = form.observations || undefined;

    const payload: any = {
      name: form.name,
      description: form.description || null,
      client_id: form.client_id || null,
      delivery_date: form.delivery_date || null,
      value: form.value ? Number(form.value) : null,
      status: form.status,
      notes: JSON.stringify(meta),
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("service_orders").update(payload).eq("id", editId));
    } else {
      payload.company_id = companyId;
      ({ error } = await supabase.from("service_orders").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editId ? "OS atualizada" : "OS criada");
    qc.invalidateQueries({ queryKey: ["service-orders"] });
    onClose();
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editId ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Título *</Label>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_META) as OSStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data agendada</Label>
            <Input type="date" value={form.delivery_date}
              onChange={(e) => set("delivery_date", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" value={form.value}
              onChange={(e) => set("value", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Equipamento</Label>
            <Input value={form.equipment} onChange={(e) => set("equipment", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Número de série</Label>
            <Input value={form.serial_number}
              onChange={(e) => set("serial_number", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Descrição</Label>
          <Textarea value={form.description}
            onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea value={form.observations}
            onChange={(e) => set("observations", e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ---------- view dialog with tabs ----------

function OSViewDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();

  const { data: os } = useQuery({
    queryKey: ["service-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, clients!client_id(company_name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!os) {
    return (
      <DialogContent>
        <DialogHeader><DialogTitle>Carregando...</DialogTitle></DialogHeader>
      </DialogContent>
    );
  }

  const meta = parseMeta(os.notes);
  const checklist: { id: string; item: string; completed: boolean }[] =
    Array.isArray(os.checklist) ? (os.checklist as any) : [];
  const status = (os.status as OSStatus) || "pendente";
  const sm = STATUS_META[status] || STATUS_META.pendente;

  async function updateMeta(next: Partial<OSMeta>) {
    const merged = { ...meta, ...next, _os: true as const };
    const { error } = await supabase.from("service_orders")
      .update({ notes: JSON.stringify(merged) }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["service-order", id] });
    qc.invalidateQueries({ queryKey: ["service-orders"] });
  }

  async function updateChecklist(next: typeof checklist) {
    const { error } = await supabase.from("service_orders")
      .update({ checklist: next as any }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["service-order", id] });
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground font-mono">OS #{osNumber(id)}</div>
            <DialogTitle className="mt-1">{os.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {os.clients?.company_name || "Sem cliente"}
            </p>
          </div>
          <Badge className={sm.cls} variant="secondary">{sm.label}</Badge>
        </div>
      </DialogHeader>

      <Tabs defaultValue="dados">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-3 pt-4">
          <DataRow label="Cliente" value={os.clients?.company_name || "—"} />
          <DataRow label="Título" value={os.name} />
          <DataRow label="Descrição" value={os.description || "—"} />
          <DataRow label="Status" value={sm.label} />
          <DataRow label="Equipamento" value={meta.equipment || "—"} />
          <DataRow label="Número de série" value={meta.serial_number || "—"} />
          <DataRow label="Data agendada"
            value={os.delivery_date ? new Date(os.delivery_date).toLocaleDateString("pt-BR") : "—"} />
          <DataRow label="Valor" value={brl(Number(os.value || 0))} />
          <DataRow label="Observações" value={meta.observations || "—"} />
        </TabsContent>

        <TabsContent value="itens" className="pt-4">
          <ItemsTab items={meta.items || []}
            onChange={(items) => updateMeta({ items })} />
        </TabsContent>

        <TabsContent value="checklist" className="pt-4">
          <ChecklistTab items={checklist} onChange={updateChecklist} />
        </TabsContent>

        <TabsContent value="anexos" className="pt-4">
          <PhotosTab osId={id} companyId={os.company_id} photos={meta.photos || []}
            onChange={(photos) => updateMeta({ photos })} />
        </TabsContent>

        <TabsContent value="pdf" className="pt-4">
          <PdfTab os={os} meta={meta} checklist={checklist}
            onUrl={(pdf_url) => updateMeta({ pdf_url })} />
        </TabsContent>

        <TabsContent value="assinatura" className="pt-4">
          <SignatureTab url={meta.signature_url}
            onSave={(signature_url) => updateMeta({ signature_url })} />
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b last:border-0">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="col-span-2 text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
}

// ---------- Items tab ----------

function ItemsTab({
  items, onChange,
}: { items: OSItem[]; onChange: (items: OSItem[]) => void }) {
  const [draft, setDraft] = useState<OSItem>({
    id: "", description: "", quantity: 1, unit_price: 0,
  });

  function add() {
    if (!draft.description.trim()) return toast.error("Descrição obrigatória");
    const next = [...items, { ...draft, id: crypto.randomUUID() }];
    onChange(next);
    setDraft({ id: "", description: "", quantity: 1, unit_price: 0 });
  }

  function update(id: string, patch: Partial<OSItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  const total = itemsTotal(items);

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Descrição</Label>
            <Input value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Qtd</Label>
            <Input type="number" min="0" step="1" value={draft.quantity}
              onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Valor unitário</Label>
            <Input type="number" min="0" step="0.01" value={draft.unit_price}
              onChange={(e) => setDraft({ ...draft, unit_price: Number(e.target.value) })} />
          </div>
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-24">Qtd</TableHead>
              <TableHead className="w-36">Valor unitário</TableHead>
              <TableHead className="w-32">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                  Nenhum item adicionado
                </TableCell>
              </TableRow>
            ) : (
              items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <Input value={i.description}
                      onChange={(e) => update(i.id, { description: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={i.quantity}
                      onChange={(e) => update(i.id, { quantity: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.01" value={i.unit_price}
                      onChange={(e) => update(i.id, { unit_price: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {brl(i.quantity * i.unit_price)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-muted/40">
          <span className="text-sm text-muted-foreground">Total dos itens</span>
          <span className="font-semibold text-lg">{brl(total)}</span>
        </div>
      </Card>
    </div>
  );
}

// ---------- Checklist tab ----------

function ChecklistTab({
  items, onChange,
}: {
  items: { id: string; item: string; completed: boolean }[];
  onChange: (items: { id: string; item: string; completed: boolean }[]) => void;
}) {
  const [text, setText] = useState("");

  function add() {
    if (!text.trim()) return;
    onChange([...items, { id: crypto.randomUUID(), item: text.trim(), completed: false }]);
    setText("");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Novo item do checklist..." value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
      </div>

      <Card className="divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <ListChecks className="h-8 w-8 opacity-40" />
            Nenhum item no checklist
          </div>
        ) : items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 p-3">
            <Checkbox checked={it.completed}
              onCheckedChange={(v) =>
                onChange(items.map((x) => x.id === it.id ? { ...x, completed: !!v } : x))
              } />
            <span className={`flex-1 text-sm ${it.completed ? "line-through text-muted-foreground" : ""}`}>
              {it.item}
            </span>
            <Button variant="ghost" size="icon"
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---------- Photos tab ----------

function PhotosTab({
  osId, companyId, photos, onChange,
}: {
  osId: string;
  companyId: string;
  photos: OSPhoto[];
  onChange: (photos: OSPhoto[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: OSPhoto[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${companyId}/service-orders/${osId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("client-logos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("client-logos").getPublicUrl(path);
      added.push({ id: crypto.randomUUID(), url: data.publicUrl, path });
    }
    setUploading(false);
    if (added.length) onChange([...photos, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removePhoto(p: OSPhoto) {
    await supabase.storage.from("client-logos").remove([p.path]);
    onChange(photos.filter((x) => x.id !== p.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input ref={fileRef} type="file" accept="image/*" multiple
          onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
        {uploading && <span className="text-xs text-muted-foreground">Enviando...</span>}
      </div>

      {photos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto opacity-40 mb-2" />
          Nenhuma imagem anexada
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden border">
              <img src={p.url} alt="" className="w-full h-32 object-cover" />
              <Button variant="destructive" size="icon"
                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition"
                onClick={() => removePhoto(p)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- PDF tab ----------

function PdfTab({
  os, meta, checklist, onUrl,
}: {
  os: any;
  meta: OSMeta;
  checklist: { id: string; item: string; completed: boolean }[];
  onUrl: (url: string) => void;
}) {
  function buildHtml() {
    const items = meta.items || [];
    const total = Number(os.value || 0) + itemsTotal(items);
    return `<!doctype html><html><head><meta charset="utf-8"><title>OS ${osNumber(os.id)}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:32px;color:#111;max-width:800px;margin:auto}
  h1{margin:0 0 4px} .muted{color:#666;font-size:12px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}
  .box{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
  th{background:#f5f5f5}
  .right{text-align:right} .total{font-size:18px;font-weight:600;margin-top:8px}
  ul{padding-left:18px}
  img.sig{max-width:300px;border:1px solid #ddd;border-radius:6px;padding:4px;background:#fff}
</style></head><body>
<h1>Ordem de Serviço #${osNumber(os.id)}</h1>
<div class="muted">Emitida em ${new Date().toLocaleDateString("pt-BR")}</div>
<div class="grid">
  <div><strong>Cliente:</strong> ${os.clients?.company_name || "—"}</div>
  <div><strong>Status:</strong> ${STATUS_META[(os.status as OSStatus) || "pendente"].label}</div>
  <div><strong>Data agendada:</strong> ${os.delivery_date ? new Date(os.delivery_date).toLocaleDateString("pt-BR") : "—"}</div>
  <div><strong>Equipamento:</strong> ${meta.equipment || "—"}</div>
  <div><strong>Nº de série:</strong> ${meta.serial_number || "—"}</div>
  <div><strong>Título:</strong> ${escapeHtml(os.name)}</div>
</div>
<div class="box"><strong>Descrição</strong><div>${escapeHtml(os.description || "—")}</div></div>
${items.length ? `<div class="box"><strong>Itens</strong>
<table><thead><tr><th>Descrição</th><th>Qtd</th><th>Valor unit.</th><th>Total</th></tr></thead>
<tbody>${items.map(i => `<tr><td>${escapeHtml(i.description)}</td><td>${i.quantity}</td><td>${brl(i.unit_price)}</td><td>${brl(i.quantity * i.unit_price)}</td></tr>`).join("")}</tbody></table>
<div class="total right">Total: ${brl(total)}</div></div>` : ""}
${checklist.length ? `<div class="box"><strong>Checklist</strong><ul>${checklist.map(c => `<li>${c.completed ? "✅" : "⬜"} ${escapeHtml(c.item)}</li>`).join("")}</ul></div>` : ""}
${meta.observations ? `<div class="box"><strong>Observações</strong><div>${escapeHtml(meta.observations)}</div></div>` : ""}
${meta.signature_url ? `<div class="box"><strong>Assinatura</strong><br/><img class="sig" src="${meta.signature_url}"/></div>` : ""}
</body></html>`;
  }

  function generate() {
    const html = buildHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    onUrl(url);
    window.open(url, "_blank");
    toast.success("PDF gerado");
  }

  function openExisting() {
    if (!meta.pdf_url) return toast.error("Nenhum PDF gerado ainda");
    window.open(meta.pdf_url, "_blank");
  }

  return (
    <Card className="p-6 space-y-4 text-center">
      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">
        Gere uma versão imprimível desta ordem de serviço.
      </p>
      {meta.pdf_url && (
        <p className="text-xs text-muted-foreground break-all">
          Último PDF: <span className="font-mono">{meta.pdf_url.slice(0, 80)}...</span>
        </p>
      )}
      <div className="flex gap-2 justify-center">
        <Button onClick={generate}><Printer className="h-4 w-4 mr-1" /> Gerar PDF</Button>
        <Button variant="outline" onClick={openExisting} disabled={!meta.pdf_url}>
          <FileText className="h-4 w-4 mr-1" /> Abrir PDF
        </Button>
      </div>
    </Card>
  );
}

function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]!));
}

// ---------- Signature tab ----------

function SignatureTab({
  url, onSave,
}: { url?: string; onSave: (url: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineWidth = 2; ctx.strokeStyle = "#111"; ctx.lineCap = "round";
  }, []);

  function pos(e: React.PointerEvent) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }

  function down(e: React.PointerEvent) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke();
    setDrawn(true);
  }
  function up() { drawing.current = false; }

  function clear() {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    setDrawn(false);
  }

  function save() {
    if (!drawn) return toast.error("Faça a assinatura antes de salvar");
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    onSave(dataUrl);
    toast.success("Assinatura salva");
  }

  return (
    <div className="space-y-4">
      {url && (
        <Card className="p-4 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">Assinatura registrada</p>
          <img src={url} alt="Assinatura" className="max-h-32 border rounded bg-white p-1" />
        </Card>
      )}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <PenLine className="h-4 w-4" /> Assinar Ordem de Serviço
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full border rounded bg-white touch-none cursor-crosshair"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={clear}>Limpar</Button>
          <Button onClick={save}>Salvar assinatura</Button>
        </div>
      </Card>
    </div>
  );
}
