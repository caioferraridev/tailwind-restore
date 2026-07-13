import { createFileRoute } from "@tanstack/react-router";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowLeft,
  Trash2,
  Save,
} from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute(
  "/app/demands/$demandId"
)({
  component: DemandDetailsPage,
});

function DemandDetailsPage() {
  const { demandId } =
    Route.useParams();

  const qc = useQueryClient();

  const {
    data: demand,
    isLoading,
  } = useQuery({
    queryKey: [
      "demand",
      demandId,
    ],

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("demands")
          .select("*")
          .eq("id", demandId)
          .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  async function handleUpdate(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);

    const form =
      e.target as HTMLFormElement;

    const formData =
      new FormData(form);

    const payload = {
      title:
        formData.get("title"),

      description:
        formData.get(
          "description"
        ),

      status:
        formData.get("status"),

      observations:
        formData.get(
          "observations"
        ),

      due_date:
        formData.get(
          "due_date"
        ) || null,
    };

    const { error } =
      await supabase
        .from("demands")
        .update(payload)
        .eq("id", demandId);

    setSaving(false);

    if (error) {
      toast.error(error.message);

      return;
    }

    toast.success(
      "Demanda atualizada"
    );

    qc.invalidateQueries({
      queryKey: ["demand"],
    });

    qc.invalidateQueries({
      queryKey: ["demands"],
    });
  }

  async function handleDelete() {
    const confirmDelete =
      confirm(
        "Deseja excluir esta demanda?"
      );

    if (!confirmDelete) {
      return;
    }

    setDeleting(true);

    await supabase
      .from("calendar_events")
      .delete()
      .eq("demand_id", demandId);

    const { error } =
      await supabase
        .from("demands")
        .delete()
        .eq("id", demandId);

    setDeleting(false);

    if (error) {
      toast.error(error.message);

      return;
    }

    toast.success(
      "Demanda excluída"
    );

    window.location.href =
      "/app/demands";
  }

  if (isLoading) {
    return (
      <Card className="p-10">
        Carregando...
      </Card>
    );
  }

  if (!demand) {
    return (
      <Card className="p-10">
        Demanda não encontrada
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() =>
            window.history.back()
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />

          {deleting
            ? "Excluindo..."
            : "Excluir"}
        </Button>
      </div>

      <Card className="p-6">
        <form
          onSubmit={handleUpdate}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>
              Título
            </Label>

            <Input
              name="title"
              defaultValue={
                demand.title
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Status
            </Label>

            <Select
              defaultValue={
                demand.status ||
                "pendente"
              }
              name="status"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="pendente">
                  Pendente
                </SelectItem>

                <SelectItem value="em_andamento">
                  Em andamento
                </SelectItem>

                <SelectItem value="concluida">
                  Concluída
                </SelectItem>

                <SelectItem value="cancelada">
                  Cancelada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Prazo de entrega
            </Label>

            <Input
              type="date"
              name="due_date"
              defaultValue={
                demand.due_date
                  ? new Date(
                      demand.due_date
                    )
                      .toISOString()
                      .slice(0, 10)
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Descrição
            </Label>

            <Textarea
              rows={6}
              name="description"
              defaultValue={
                demand.description ||
                ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Observações internas
            </Label>

            <Textarea
              rows={5}
              name="observations"
              defaultValue={
                demand.observations ||
                ""
              }
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />

            {saving
              ? "Salvando..."
              : "Salvar alterações"}
          </Button>
        </form>
      </Card>
    </div>
  );
}