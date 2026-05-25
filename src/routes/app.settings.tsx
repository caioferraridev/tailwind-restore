import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company", profile?.company_id],
    enabled: !!profile?.company_id,
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*").eq("id", profile!.company_id).single();
      return data;
    },
  });

  const [form, setForm] = useState<any>({
    name: "", trade_name: "", cnpj: "", email: "", phone: "", whatsapp: "",
    address: "", city: "", state: "", zip_code: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) setForm({ ...form, ...company });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.company_id) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      name: form.name, trade_name: form.trade_name, cnpj: form.cnpj,
      email: form.email, phone: form.phone, whatsapp: form.whatsapp,
      address: form.address, city: form.city, state: form.state, zip_code: form.zip_code,
      notes: form.notes,
    }).eq("id", profile.company_id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas!");
    qc.invalidateQueries({ queryKey: ["company"] });
  }

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
        <p className="text-sm text-muted-foreground mt-1">Dados administrativos da sua agência</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2"><Label>Nome da empresa *</Label>
              <Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Nome fantasia</Label>
              <Input value={form.trade_name || ""} onChange={(e) => set("trade_name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>CNPJ</Label>
              <Input value={form.cnpj || ""} onChange={(e) => set("cnpj", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label>
              <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>WhatsApp</Label>
              <Input value={form.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>CEP</Label>
              <Input value={form.zip_code || ""} onChange={(e) => set("zip_code", e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Endereço</Label>
              <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Cidade</Label>
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Estado</Label>
              <Input value={form.state || ""} onChange={(e) => set("state", e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Observações</Label>
              <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </form>
      </Card>
    </div>
  );
}
