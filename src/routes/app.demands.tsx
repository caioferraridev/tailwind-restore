import { createFileRoute } from "@tanstack/react-router";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";

import { useAuth } from "@/lib/auth";

import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Plus,
  CalendarDays,
} from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute("/app/demands")({
  component: DemandsPage,
});

type Demand = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  delivery_date?: string | null;
  created_at?: string;
};

function DemandsPage() {
  const { profile } = useAuth();
  console.log("PROFILE COMPLETO");
console.log(profile);
console.log("PROFILE COMPANY ID");
console.log(profile?.company_id);

  const [open, setOpen] = useState(false);

  const {
    data: demands = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "demands",
      profile?.company_id,
    ],

    enabled: !!profile?.company_id,

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("demands")
          .select("*")
          .eq(
            "company_id",
            profile?.company_id
          )
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(
          "DEMANDS ERROR",
          error
        );

        throw error;
      }

      return (data || []) as Demand[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Demandas
          </h1>

          <p className="text-muted-foreground mt-2">
            Gerencie demandas da agência
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Demanda
            </Button>
          </DialogTrigger>

          <CreateDemandDialog
            companyId={
              profile?.company_id
            }
            onClose={() =>
              setOpen(false)
            }
          />
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="p-10 text-center">
          Carregando demandas...
        </Card>
      ) : demands.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nenhuma demanda encontrada
        </Card>
      ) : (
        <div className="grid gap-4">
          {demands.map((demand) => (
            <Card
              key={demand.id}
              className="p-5"
            >
              <div className="space-y-2">
                <h2 className="font-semibold text-lg">
                  {demand.name}
                </h2>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {demand.description ||
                    "Sem descrição"}
                </p>

                {demand.delivery_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />

                    Prazo:
                    {" "}
                    {new Date(
                      demand.delivery_date
                    ).toLocaleDateString(
                      "pt-BR"
                    )}
                  </div>
                )}

                <div className="text-sm font-medium">
                  Status:
                  {" "}
                  {demand.status}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateDemandDialog({
  companyId,
  onClose,
}: any) {
  const qc =
    useQueryClient();

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    deliveryDate,
    setDeliveryDate,
  ] = useState("");

  async function handleCreate(
  e: React.FormEvent
) {
  e.preventDefault();
console.log("COMPANY ID", companyId);
  if (!companyId) {
    toast.error(
      "Empresa não encontrada"
    );
    return;
  }

  if (!name.trim()) {
    toast.error(
      "Informe um nome"
    );
    return;
  }

  setSaving(true);

  console.log(
    "CRIANDO DEMANDA",
    {
      company_id: companyId,
      name,
      description,
      delivery_date:
        deliveryDate || null,
      status: "pending",
      priority: "medium",
    }
  );

  const { error } =
    await supabase
      .from("demands")
      .insert([
        {
          company_id: companyId,
          name: name.trim(),
          description:
            description || null,
          delivery_date:
            deliveryDate || null,
          status: "pending",
          priority: "medium",
        } as any,
      ]);

  setSaving(false);

  if (error) {
    console.error(
      "CREATE DEMAND ERROR",
      error
    );

    toast.error(
      error.message
    );

    return;
  }

  toast.success(
    "Demanda criada"
  );

  await qc.invalidateQueries({
    queryKey: ["demands"],
  });

  setName("");
  setDescription("");
  setDeliveryDate("");

  onClose();
}

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          Nova Demanda
        </DialogTitle>
      </DialogHeader>

      <form
        onSubmit={handleCreate}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Nome</Label>

          <Input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Data de entrega
          </Label>

          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) =>
              setDeliveryDate(
                e.target.value
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Descrição
          </Label>

          <Textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Salvando..."
              : "Criar Demanda"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}