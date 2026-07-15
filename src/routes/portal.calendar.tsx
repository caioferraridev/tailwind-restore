import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";

export const Route = createFileRoute("/portal/calendar")({
  component: PortalCalendar,
});

export default function PortalCalendar() {
  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const { data: client } = useQuery({
    queryKey: ["portal-client", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      return data;
    },
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["portal-events", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("client_id", clientId)
        .order("start_at");

      return data ?? [];
    },
  });

  return (
    <PortalLayout>

      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name}
        />

        <div>

          <h2 className="text-3xl font-bold">
            Agenda
          </h2>

          <p className="text-muted-foreground mt-2">
            Todos os eventos relacionados ao seu projeto.
          </p>

        </div>

        <div className="rounded-xl border bg-background overflow-hidden">

          <div className="border-b p-6">

            <h3 className="font-semibold text-lg">
              Eventos
            </h3>

          </div>

          {events.length === 0 ? (

            <div className="p-10 text-center text-muted-foreground">

              Nenhum evento encontrado.

            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-muted">

                <tr>

                  <th className="text-left p-5">
                    Evento
                  </th>

                  <th className="text-left">
                    Data
                  </th>

                  <th className="text-left">
                    Status
                  </th>

                  <th className="text-left">
                    Prioridade
                  </th>

                </tr>

              </thead>

              <tbody>

                {events.map((event) => (

                  <tr
                    key={event.id}
                    className="border-t hover:bg-muted/30"
                  >

                    <td className="p-5">

                      <div>

                        <p className="font-medium">

                          {event.title}

                        </p>

                        <p className="text-sm text-muted-foreground">

                          {event.description}

                        </p>

                      </div>

                    </td>

                    <td>

                      {event.start_at
                        ? new Date(event.start_at).toLocaleString("pt-BR")
                        : "-"}

                    </td>

                    <td>

                      {event.status}

                    </td>

                    <td>

                      {event.priority}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </PortalLayout>
  );
}