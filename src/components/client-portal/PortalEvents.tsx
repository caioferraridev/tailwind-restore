import {
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";

type Event = {
  id: string;
  title: string;
  description?: string;
  start_at: string | null;
  end_at?: string | null;
  location?: string | null;
  status?: string | null;
};

type Props = {
  events: Event[];
};

export default function PortalEvents({
  events,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="border-b p-6">

        <h2 className="text-xl font-semibold">
          Agenda
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Próximos compromissos relacionados ao seu projeto.
        </p>

      </div>

      {events.length === 0 ? (

        <div className="p-12 text-center text-muted-foreground">

          Nenhum evento cadastrado.

        </div>

      ) : (

        <div className="divide-y">

          {events.map((event) => (

            <div
              key={event.id}
              className="p-6 hover:bg-muted/30 transition"
            >

              <div className="flex items-start justify-between">

                <div className="space-y-2">

                  <div className="flex items-center gap-2">

                    <CalendarDays
                      size={18}
                      className="text-primary"
                    />

                    <h3 className="font-semibold text-lg">

                      {event.title}

                    </h3>

                  </div>

                  {event.description && (

                    <p className="text-sm text-muted-foreground">

                      {event.description}

                    </p>

                  )}

                  <div className="flex flex-wrap gap-5 mt-3">

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                      <Clock size={16} />

                      <span>

                        {event.start_at
                          ? new Date(event.start_at).toLocaleString("pt-BR")
                          : "-"}

                      </span>

                    </div>

                    {event.location && (

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">

                        <MapPin size={16} />

                        <span>

                          {event.location}

                        </span>

                      </div>

                    )}

                  </div>

                </div>

                {event.status && (

                  <span
                    className="
                      rounded-full
                      bg-primary/10
                      text-primary
                      px-3
                      py-1
                      text-xs
                      font-medium
                    "
                  >
                    {event.status}
                  </span>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

      <div className="border-t bg-muted/20 p-4 flex justify-between">

        <span className="text-sm text-muted-foreground">

          Total de eventos

        </span>

        <span className="font-semibold">

          {events.length}

        </span>

      </div>

    </div>

  );

}