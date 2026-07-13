import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useMemo, useState } from "react";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";

export const Route = createFileRoute("/portal/services")({
  component: PortalServicesPage,
});

function getStatusColor(status?: string) {

  switch (status?.toLowerCase()) {

    case "ativo":
    case "active":
      return "bg-green-100 text-green-700";

    case "paused":
    case "pausado":
      return "bg-yellow-100 text-yellow-700";

    case "cancelado":
    case "cancelled":
      return "bg-red-100 text-red-700";

    case "concluido":
    case "completed":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";

  }

}

export default function PortalServicesPage() {

  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("todos");

  // ================================
  // CLIENTE
  // ================================

  const { data: client } = useQuery({

    queryKey: ["portal-client", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data, error } = await supabase

        .from("clients")

        .select("*")

        .eq("id", clientId)

        .single();

      if (error) throw error;

      return data;

    },

  });

  // ================================
  // SERVIÇOS
  // ================================

  const { data: services = [] } = useQuery<any[]>({

    queryKey: ["portal-services", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data, error } = await supabase

        .from("client_services")

        .select(`
          *,
          services (
            name,
            description
          )
        `)

        .eq("client_id", clientId);

      if (error) throw error;

      return data ?? [];

    },

  });

  // ================================
  // FILTROS
  // ================================

  const filteredServices = useMemo(() => {

    return services.filter((service) => {

      const searchMatch =
        service.services?.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "todos"
          ? true
          : service.status === statusFilter;

      return searchMatch && statusMatch;

    });

  }, [services, search, statusFilter]);

  // ================================
  // RESUMO
  // ================================

  const active = services.filter(
    (s) =>
      s.status?.toLowerCase() === "ativo" ||
      s.status?.toLowerCase() === "active"
  ).length;

  const paused = services.filter(
    (s) =>
      s.status?.toLowerCase() === "pausado" ||
      s.status?.toLowerCase() === "paused"
  ).length;

  const completed = services.filter(
    (s) =>
      s.status?.toLowerCase() === "concluido" ||
      s.status?.toLowerCase() === "completed"
  ).length;

  const total = services.length;

  return (

    <PortalLayout>

      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name}
        />

        <div>

          <h2 className="text-3xl font-bold">

            Serviços

          </h2>

          <p className="text-muted-foreground mt-2">

            Todos os serviços contratados junto à agência.

          </p>

        </div>
                {/* Cards */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Serviços Ativos
            </p>

            <h2 className="text-3xl font-bold mt-3 text-green-600">
              {active}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Pausados
            </p>

            <h2 className="text-3xl font-bold mt-3 text-yellow-600">
              {paused}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Concluídos
            </p>

            <h2 className="text-3xl font-bold mt-3 text-blue-600">
              {completed}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Total
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {total}
            </h2>

          </div>

        </div>

        {/* Pesquisa */}

        <div className="rounded-xl border p-6">

          <div className="grid lg:grid-cols-2 gap-5">

            <input

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              placeholder="Pesquisar serviço..."

              className="border rounded-lg px-4 h-11 bg-background"

            />

            <select

              value={statusFilter}

              onChange={(e) =>
                setStatusFilter(e.target.value)
              }

              className="border rounded-lg px-4 h-11 bg-background"

            >

              <option value="todos">
                Todos
              </option>

              <option value="ativo">
                Ativos
              </option>

              <option value="pausado">
                Pausados
              </option>

              <option value="concluido">
                Concluídos
              </option>

            </select>

          </div>

        </div>

        {/* Lista */}

        <div className="rounded-xl border overflow-hidden">

          <div className="border-b p-6">

            <h3 className="text-xl font-semibold">

              Serviços Contratados

            </h3>

            <p className="text-sm text-muted-foreground mt-1">

              Todos os serviços atualmente vinculados à sua empresa.

            </p>

          </div>
                  {filteredServices.length === 0 ? (

          <div className="p-12 text-center text-muted-foreground">

            Nenhum serviço encontrado.

          </div>

        ) : (

          <div className="divide-y">

            {filteredServices.map((service: any) => (

              <div
                key={service.id}
                className="p-6 hover:bg-muted/20 transition-all"
              >

                <div className="flex justify-between items-start gap-8">

                  <div className="flex-1">

                    <div className="flex items-center gap-3">

                      <h3 className="text-xl font-semibold">

                        {service.services?.name ?? "Serviço"}

                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          service.status
                        )}`}
                      >
                        {service.status ?? "Ativo"}
                      </span>

                    </div>

                    <p className="text-muted-foreground mt-2">

                      {service.services?.description ||
                        "Sem descrição cadastrada."}

                    </p>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

                      <div>

                        <p className="text-xs uppercase text-muted-foreground">

                          Valor Mensal

                        </p>

                        <p className="font-semibold mt-1">

                          {service.monthly_value
                            ? Number(service.monthly_value).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )
                            : "—"}

                        </p>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-muted-foreground">

                          Início

                        </p>

                        <p className="font-semibold mt-1">

                          {service.start_date
                            ? new Date(
                                service.start_date
                              ).toLocaleDateString("pt-BR")
                            : "—"}

                        </p>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-muted-foreground">

                          Término

                        </p>

                        <p className="font-semibold mt-1">

                          {service.end_date
                            ? new Date(
                                service.end_date
                              ).toLocaleDateString("pt-BR")
                            : "Sem previsão"}

                        </p>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-muted-foreground">

                          SLA

                        </p>

                        <p className="font-semibold mt-1">

                          {service.sla || "Conforme contrato"}

                        </p>

                      </div>

                    </div>

                    {service.notes && (

                      <div className="mt-6 rounded-lg border bg-muted/30 p-4">

                        <p className="text-xs uppercase text-muted-foreground mb-2">

                          Observações

                        </p>

                        <p>

                          {service.notes}

                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  </PortalLayout>

);

}