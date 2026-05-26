import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  Plus,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute(
  "/app/calendar"
)({
  component: CalendarPage,
});

function CalendarPage() {
  const qc = useQueryClient();

  const [cursor, setCursor] = useState(
    new Date()
  );

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [open, setOpen] = useState(false);

  const start = new Date(
    cursor.getFullYear(),
    cursor.getMonth(),
    1
  );

  const end = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const { data: events = [] } =
    useQuery({
      queryKey: [
        "calendar-events",
        cursor.getMonth(),
        cursor.getFullYear(),
      ],

      queryFn: async () => {
        const { data, error } =
          await supabase
            .from("calendar_events")
            .select(`
              *,
              clients(
                id,
                company_name
              )
            `)
            .gte(
              "start_at",
              start.toISOString()
            )
            .lte(
              "start_at",
              end.toISOString()
            )
            .order("start_at");

        if (error) {
          throw error;
        }

        return data || [];
      },
    });

  const { data: clients = [] } =
    useQuery({
      queryKey: ["calendar-clients"],

      queryFn: async () => {
        const { data, error } =
          await supabase
            .from("clients")
            .select("id, company_name")
            .order("company_name");

        if (error) {
          throw error;
        }

        return data || [];
      },
    });

  const firstDay = start.getDay();

  const daysInMonth = end.getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (
    let d = 1;
    d <= daysInMonth;
    d++
  ) {
    cells.push(
      new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        d
      )
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weekDays = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
  ];

  const eventsForDay = (date: Date) =>
    events.filter((e: any) => {
      const d = new Date(e.start_at);

      return (
        d.toDateString() ===
        date.toDateString()
      );
    });

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(
        (e: any) =>
          new Date(e.start_at) >= new Date()
      )
      .slice(0, 5);
  }, [events]);

  async function deleteEvent(id: string) {
    const confirmDelete = confirm(
      "Deseja excluir este evento?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Evento excluído");

    qc.invalidateQueries({
      queryKey: ["calendar-events"],
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Calendário
          </h1>

          <p className="text-muted-foreground mt-1">
            Agenda profissional da
            agência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth() - 1,
                  1
                )
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setCursor(new Date())
            }
          >
            Hoje
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth() + 1,
                  1
                )
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>

            <CreateEventDialog
              clients={clients}
              selectedDate={
                selectedDate
              }
              onClose={() =>
                setOpen(false)
              }
            />
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <Card className="p-4 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold capitalize">
                    {cursor.toLocaleDateString(
                      "pt-BR",
                      {
                        month:
                          "long",
                        year:
                          "numeric",
                      }
                    )}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {
                      events.length
                    }{" "}
                    evento(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="bg-muted py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}

              {cells.map(
                (date, i) => {
                  const isToday =
                    date &&
                    date.toDateString() ===
                      new Date().toDateString();

                  const dayEvents =
                    date
                      ? eventsForDay(
                          date
                        )
                      : [];

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (
                          date
                        ) {
                          setSelectedDate(
                            date
                          );

                          setOpen(
                            true
                          );
                        }
                      }}
                      className={`
                        min-h-[150px]
                        bg-card
                        p-2
                        transition
                        hover:bg-muted/40
                        cursor-pointer
                        ${
                          !date
                            ? "bg-muted/20"
                            : ""
                        }
                        ${
                          isToday
                            ? "ring-2 ring-primary"
                            : ""
                        }
                      `}
                    >
                      {date && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-semibold ${
                                isToday
                                  ? "text-primary"
                                  : ""
                              }`}
                            >
                              {date.getDate()}
                            </span>

                            {dayEvents.length >
                              0 && (
                              <Badge variant="secondary">
                                {
                                  dayEvents.length
                                }
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {dayEvents
                              .slice(
                                0,
                                4
                              )
                              .map(
                                (
                                  e: any
                                ) => (
                                  <div
                                    key={
                                      e.id
                                    }
                                    className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-1.5"
                                  >
                                    <p className="text-[11px] font-medium text-primary truncate">
                                      {
                                        e.title
                                      }
                                    </p>

                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {new Date(
                                        e.start_at
                                      ).toLocaleTimeString(
                                        "pt-BR",
                                        {
                                          hour:
                                            "2-digit",
                                          minute:
                                            "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                )
                              )}

                            {dayEvents.length >
                              4 && (
                              <div className="text-[11px] text-muted-foreground">
                                +
                                {dayEvents.length -
                                  4}{" "}
                                eventos
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-lg mb-4">
              Próximos eventos
            </h3>

            <div className="space-y-3">
              {upcomingEvents.length ===
              0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum evento
                  próximo
                </p>
              ) : (
                upcomingEvents.map(
                  (e: any) => (
                    <div
                      key={e.id}
                      className="rounded-xl border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-sm">
                            {e.title}
                          </h4>

                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              e
                                ?.clients
                                ?.company_name
                            }
                          </p>

                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />

                            {new Date(
                              e.start_at
                            ).toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            deleteEvent(
                              e.id
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CreateEventDialog({
  clients,
  selectedDate,
  onClose,
}: any) {
  const qc = useQueryClient();

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    client_id: "",
    event_type: "reuniao",

    start_at: selectedDate
      ? `${selectedDate
          .toISOString()
          .slice(0, 10)}T09:00`
      : "",

    end_at: selectedDate
      ? `${selectedDate
          .toISOString()
          .slice(0, 10)}T10:00`
      : "",
  });

  function setField(
    key: string,
    value: string
  ) {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  }

  async function handleSave(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("calendar_events")
      .insert([
        {
          title: form.title,

          description:
            form.description,

          location:
            form.location,

          client_id:
            form.client_id || null,

          event_type:
            form.event_type,

          start_at:
            form.start_at,

          end_at:
            form.end_at,

          status: "agendado",

          all_day: false,

          recurring: false,

          recurring_type: null,

          color: "#3b82f6",

          notes: null,

          observations: null,
        },
      ]);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Evento criado"
    );

    qc.invalidateQueries({
      queryKey: ["calendar-events"],
    });

    onClose();
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          Novo Evento
        </DialogTitle>

        <DialogDescription>
          Crie reuniões,
          gravações, visitas,
          campanhas e tarefas da
          agência.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSave}
        className="space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>
              Título do evento
            </Label>

            <Input
              required
              value={form.title}
              onChange={(e) =>
                setField(
                  "title",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>

            <Select
              value={form.client_id}
              onValueChange={(v) =>
                setField(
                  "client_id",
                  v
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {clients.map(
                  (c: any) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                    >
                      {
                        c.company_name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>

            <Select
              value={form.event_type}
              onValueChange={(v) =>
                setField(
                  "event_type",
                  v
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="reuniao">
                  Reunião
                </SelectItem>

                <SelectItem value="gravacao">
                  Gravação
                </SelectItem>

                <SelectItem value="visita">
                  Visita
                </SelectItem>

                <SelectItem value="campanha">
                  Campanha
                </SelectItem>

                <SelectItem value="tarefa">
                  Tarefa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Início</Label>

            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) =>
                setField(
                  "start_at",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fim</Label>

            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) =>
                setField(
                  "end_at",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Local</Label>

            <Input
              value={form.location}
              onChange={(e) =>
                setField(
                  "location",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>
              Descrição
            </Label>

            <Textarea
              rows={5}
              value={
                form.description
              }
              onChange={(e) =>
                setField(
                  "description",
                  e.target.value
                )
              }
            />
          </div>
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
              : "Criar Evento"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}