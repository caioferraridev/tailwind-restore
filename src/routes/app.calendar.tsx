import { createFileRoute } from "@tanstack/react-router";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/lib/auth";

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
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
});

type CalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  client_id?: string | null;
  demand_id?: string | null;
  assigned_to?: string | null;
  event_type?: string | null;
  status?: string | null;
  color?: string | null;

  client?: {
    id: string;
    company_name: string;
  } | null;
};

function CalendarPage() {
  const qc = useQueryClient();

  const { user, profile } = useAuth();

  const [cursor, setCursor] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [open, setOpen] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const start = new Date(
    cursor.getFullYear(),
    cursor.getMonth(),
    1,
    0,
    0,
    0
  );

  const end = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const {
    data: events = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "calendar-events",
      cursor.getMonth(),
      cursor.getFullYear(),
      profile?.company_id,
    ],

    enabled: !!profile?.company_id,

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("calendar_events")
          .select(`
  
  
            *,
  client:clients!calendar_events_client_id_fkey(
    id,
    company_name
  )
`)
          .eq(
            "company_id",
            profile?.company_id
          )
          .gte(
            "start_at",
            start.toISOString()
          )
          .lte(
            "start_at",
            end.toISOString()
          )
          .order("start_at", {
            ascending: true,
          });

      if (error) {
        console.error(
          "CALENDAR EVENTS ERROR",
          error
        );

        throw error;
      }

      console.log(
        "CALENDAR EVENTS",
        data
      );

      return (data || []) as CalendarEvent[];
    },
  });

  const { data: clients = [] } =
    useQuery({
      queryKey: [
        "calendar-clients",
        profile?.company_id,
      ],

      enabled: !!profile?.company_id,

      queryFn: async () => {
        const { data, error } =
          await supabase
            .from("clients")
            .select(
              "id, company_name"
            )
            .eq(
              "company_id",
              profile?.company_id
            )
            .order(
              "company_name",
              {
                ascending: true,
              }
            );

        if (error) {
          console.error(
            "CLIENTS ERROR",
            error
          );

          throw error;
        }

        return data || [];
      },
    });

  const firstDay =
    start.getDay();

  const daysInMonth =
    end.getDate();

  const cells: (
    | Date
    | null
  )[] = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
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

  while (
    cells.length % 7 !== 0
  ) {
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

  const eventsForDay = (
    date: Date
  ) =>
    events.filter((e) => {
      const d =
        new Date(
          e.start_at
        );

      return (
        d.getFullYear() ===
          date.getFullYear() &&
        d.getMonth() ===
          date.getMonth() &&
        d.getDate() ===
          date.getDate()
      );
    });

  const upcomingEvents =
    useMemo(() => {
      return [...events]
        .filter(
          (e) =>
            new Date(
              e.start_at
            ).getTime() >=
            Date.now()
        )
        .sort(
          (a, b) =>
            new Date(
              a.start_at
            ).getTime() -
            new Date(
              b.start_at
            ).getTime()
        )
        .slice(0, 5);
    }, [events]);

  async function deleteEvent(
    id: string
  ) {
    const confirmDelete =
      confirm(
        "Deseja excluir este evento?"
      );

    if (!confirmDelete) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "calendar_events"
        )
        .delete()
        .eq("id", id);

    if (error) {
      toast.error(
        error.message
      );

      return;
    }

    toast.success(
      "Evento excluído"
    );

    await qc.invalidateQueries({
      queryKey: [
        "calendar-events",
      ],
    });

    setDetailsOpen(false);
  }

  async function concludeEvent(
    id: string
  ) {
    const { error } =
      await supabase
        .from(
          "calendar_events"
        )
        .update({
          status:
            "concluido",
        })
        .eq("id", id);

    if (error) {
      toast.error(
        error.message
      );

      return;
    }

    toast.success(
      "Evento concluído"
    );

    await qc.invalidateQueries({
      queryKey: [
        "calendar-events",
      ],
    });

    setDetailsOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Calendário
          </h1>

          <p className="text-muted-foreground mt-1">
            Agenda profissional
            da agência
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth() -
                    1,
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
              setCursor(
                new Date()
              )
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
                  cursor.getMonth() +
                    1,
                  1
                )
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Dialog
            open={open}
            onOpenChange={
              setOpen
            }
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
              companyId={
                profile?.company_id
              }
              userId={
                user?.id
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

            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">
                Carregando calendário...
              </div>
            ) : (
              <div className="hidden md:grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden">
                {weekDays.map(
                  (d) => (
                    <div
                      key={d}
                      className="bg-muted py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {d}
                    </div>
                  )
                )}

                {cells.map(
                  (
                    date,
                    i
                  ) => {
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
                          }
                        }}
                        className={`
                          min-h-[150px]
                          bg-card
                          p-2
                          transition
                          hover:bg-muted/40
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
                                    e
                                  ) => (
                                    <button
                                      key={
                                        e.id
                                      }
                                      type="button"
                                      onClick={(
                                        ev
                                      ) => {
                                        ev.stopPropagation();

                                        setSelectedEvent(
                                          e
                                        );

                                        setDetailsOpen(
                                          true
                                        );
                                      }}
                                      className={`
                                        w-full
                                        text-left
                                        rounded-lg
                                        border
                                        px-2
                                        py-1.5
                                        transition
                                        hover:scale-[1.01]
                                        ${
                                          e.status ===
                                          "concluido"
                                            ? "bg-green-500/10 border-green-500/30"
                                            : "bg-primary/10 border-primary/20"
                                        }
                                      `}
                                    >
                                      <p
                                        className={`
                                          text-[11px]
                                          font-medium
                                          truncate
                                          ${
                                            e.status ===
                                            "concluido"
                                              ? "text-green-600"
                                              : "text-primary"
                                          }
                                        `}
                                      >
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
                                    </button>
                                  )
                                )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
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
                  (e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setSelectedEvent(
                          e
                        );

                        setDetailsOpen(
                          true
                        );
                      }}
                      className="w-full rounded-xl border p-3 text-left hover:bg-muted/40 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-sm">
                            {
                              e.title
                            }
                          </h4>

                          <p className="text-xs text-muted-foreground mt-1">
                            {e
                              ?.client
                              ?.company_name ||
                              "Sem cliente"}
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

                        {e.status ===
                          "concluido" && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={detailsOpen}
        onOpenChange={
          setDetailsOpen
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {
                selectedEvent?.title
              }
            </DialogTitle>

            <DialogDescription>
              Detalhes do
              evento
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">
                  Cliente
                </p>

                <p className="text-sm text-muted-foreground">
                  {selectedEvent
                    ?.client
                    ?.company_name ||
                    "Sem cliente"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Status
                </p>

                <Badge className="mt-1">
                  {
                    selectedEvent.status
                  }
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Início
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    selectedEvent.start_at
                  ).toLocaleString(
                    "pt-BR"
                  )}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium">
                    Descrição
                  </p>

                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {
                      selectedEvent.description
                    }
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {selectedEvent.status !==
                  "concluido" && (
                  <Button
                    onClick={() =>
                      concludeEvent(
                        selectedEvent.id
                      )
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteEvent(
                      selectedEvent.id
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateEventDialog({
  clients,
  selectedDate,
  onClose,
  companyId,
  userId,
}: any) {
  const qc =
    useQueryClient();

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      client_id: "",
      event_type:
        "reuniao",

      start_at:
        selectedDate
          ? `${selectedDate
              .toISOString()
              .slice(
                0,
                10
              )}T09:00`
          : "",

      end_at:
        selectedDate
          ? `${selectedDate
              .toISOString()
              .slice(
                0,
                10
              )}T10:00`
          : "",
    });

  function setField(
    key: string,
    value: string
  ) {
    setForm(
      (old) => ({
        ...old,
        [key]:
          value,
      })
    );
  }

  async function handleSave(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!companyId) {
      toast.error(
        "Empresa não encontrada"
      );

      return;
    }

    if (!userId) {
      toast.error(
        "Usuário não encontrado"
      );

      return;
    }

    if (!form.title) {
      toast.error(
        "Informe um título"
      );

      return;
    }

    if (!form.start_at) {
      toast.error(
        "Informe a data inicial"
      );

      return;
    }

    setSaving(true);

    const payload = {
      company_id:
        companyId,

      created_by:
        userId,

      assigned_to:
        userId,

      title:
        form.title,

      description:
        form.description ||
        null,

      client_id:
        form.client_id ||
        null,

      event_type:
        form.event_type,

      start_at:
        new Date(
          form.start_at
        ).toISOString(),

      end_at:
        form.end_at
          ? new Date(
              form.end_at
            ).toISOString()
          : null,

      status:
        "agendado",

      all_day:
        false,

      recurring:
        false,

      recurring_type:
        null,

      color:
        "#3b82f6",

      observations:
        form.description ||
        null,
    };

    console.log(
      "CALENDAR PAYLOAD",
      payload
    );

    const { error } =
      await supabase
        .from(
          "calendar_events"
        )
        .insert([
          payload,
        ]);

    setSaving(false);

    if (error) {
      console.error(
        "CALENDAR INSERT ERROR",
        error
      );

      toast.error(
        error.message
      );

      return;
    }

    await qc.invalidateQueries({
      queryKey: [
        "calendar-events",
      ],
    });

    toast.success(
      "Evento criado"
    );

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
          gravações,
          visitas,
          campanhas e
          tarefas.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={
          handleSave
        }
        className="space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>
              Título do
              evento
            </Label>

            <Input
              required
              value={
                form.title
              }
              onChange={(
                e
              ) =>
                setField(
                  "title",
                  e.target
                    .value
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Cliente
            </Label>

            <Select
              value={
                form.client_id
              }
              onValueChange={(
                v
              ) =>
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
                  (
                    c: any
                  ) => (
                    <SelectItem
                      key={
                        c.id
                      }
                      value={
                        c.id
                      }
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
            <Label>
              Tipo
            </Label>

            <Select
              value={
                form.event_type
              }
              onValueChange={(
                v
              ) =>
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

                <SelectItem value="postagem">
                  Postagem
                </SelectItem>

                <SelectItem value="financeiro">
                  Financeiro
                </SelectItem>

                <SelectItem value="followup">
                  Follow-up
                </SelectItem>

                <SelectItem value="interno">
                  Interno
                </SelectItem>

                <SelectItem value="entrega">
                  Entrega
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Início
            </Label>

            <Input
              required
              type="datetime-local"
              value={
                form.start_at
              }
              onChange={(
                e
              ) =>
                setField(
                  "start_at",
                  e.target
                    .value
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Fim
            </Label>

            <Input
              type="datetime-local"
              value={
                form.end_at
              }
              onChange={(
                e
              ) =>
                setField(
                  "end_at",
                  e.target
                    .value
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
              onChange={(
                e
              ) =>
                setField(
                  "description",
                  e.target
                    .value
                )
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              saving
            }
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