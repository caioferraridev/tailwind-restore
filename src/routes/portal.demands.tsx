import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useMemo, useState } from "react";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";

export const Route = createFileRoute("/portal/demands")({
  component: PortalDemands,
});

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "concluido":
    case "concluído":
    case "finalizado":
      return "bg-green-100 text-green-700";

    case "pending":
    case "pendente":
      return "bg-yellow-100 text-yellow-700";

    case "in_progress":
    case "em andamento":
      return "bg-blue-100 text-blue-700";

    case "em_revisao":
    case "revisão":
      return "bg-purple-100 text-purple-700";

    case "delayed":
    case "atrasado":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPriorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case "urgent":
    case "urgente":
      return "bg-red-100 text-red-700";

    case "high":
    case "alta":
      return "bg-orange-100 text-orange-700";

    case "medium":
    case "média":
      return "bg-yellow-100 text-yellow-700";

    case "low":
    case "baixa":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PortalDemands() {

  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("todos");

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

  const { data: demands = [] } = useQuery<any[]>({

    queryKey: ["portal-demands", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data, error } = await supabase

        .from("demands")

        .select("*")

        .eq("client_id", clientId)

        .order("delivery_date");

      if (error) throw error;

      return data ?? [];

    },

  });

  const filteredDemands = useMemo(() => {

    return demands.filter((d) => {

      const searchMatch =
        d.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "todos"
          ? true
          : d.status === statusFilter;

      return searchMatch && statusMatch;

    });

  }, [demands, search, statusFilter]);

  const total = demands.length;

  const completed = demands.filter((d) =>
    ["completed", "concluido", "concluído", "finalizado"].includes(
      d.status?.toLowerCase()
    )
  ).length;

  const pending = demands.filter((d) =>
    ["pending", "pendente"].includes(
      d.status?.toLowerCase()
    )
  ).length;

  const revision = demands.filter((d) =>
    ["em_revisao", "revisão"].includes(
      d.status?.toLowerCase()
    )
  ).length;

  const delayed = demands.filter((d) =>
    ["delayed", "atrasado"].includes(
      d.status?.toLowerCase()
    )
  ).length;

  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  return (

    <PortalLayout>

      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name}
        />

        <div>

          <h2 className="text-3xl font-bold">
            Demandas
          </h2>

          <p className="text-muted-foreground mt-2">
            Acompanhe em tempo real todas as atividades do seu projeto.
          </p>

        </div>
                {/* Cards */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Total
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {total}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Pendentes
            </p>

            <h2 className="text-3xl font-bold mt-3 text-yellow-600">
              {pending}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Revisão
            </p>

            <h2 className="text-3xl font-bold mt-3 text-purple-600">
              {revision}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Concluídas
            </p>

            <h2 className="text-3xl font-bold mt-3 text-green-600">
              {completed}
            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">
              Atrasadas
            </p>

            <h2 className="text-3xl font-bold mt-3 text-red-600">
              {delayed}
            </h2>

          </div>

        </div>

        {/* Barra de progresso */}

        <div className="rounded-xl border p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-lg font-semibold">

                Progresso Geral

              </h3>

              <p className="text-sm text-muted-foreground">

                Percentual das demandas concluídas.

              </p>

            </div>

            <span className="text-4xl font-bold">

              {progress}%

            </span>

          </div>

          <div className="w-full h-4 rounded-full bg-muted mt-6">

            <div

              className="bg-primary h-4 rounded-full transition-all duration-500"

              style={{
                width: `${progress}%`,
              }}

            />

          </div>

        </div>

        {/* Busca + filtros */}

        <div className="rounded-xl border p-6">

          <div className="grid lg:grid-cols-2 gap-5">

            <input

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              placeholder="Pesquisar demanda..."

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

                Todos os Status

              </option>

              <option value="pending">

                Pendente

              </option>

              <option value="in_progress">

                Em andamento

              </option>

              <option value="em_revisao">

                Em revisão

              </option>

              <option value="completed">

                Concluído

              </option>

              <option value="delayed">

                Atrasado

              </option>

            </select>

          </div>

        </div>

        {/* Título da tabela */}

        <div className="rounded-xl border overflow-hidden">

          <div className="border-b p-6">

            <h3 className="text-xl font-semibold">

              Todas as Demandas

            </h3>

            <p className="text-sm text-muted-foreground mt-1">

              Lista completa das atividades do projeto.

            </p>

          </div>
                  {filteredDemands.length === 0 ? (

          <div className="p-12 text-center text-muted-foreground">

            Nenhuma demanda encontrada.

          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-muted/40">

              <tr>

                <th className="text-left px-6 py-4">
                  Demanda
                </th>

                <th className="text-left">
                  Status
                </th>

                <th className="text-left">
                  Prioridade
                </th>

                <th className="text-left">
                  Entrega
                </th>

                <th className="text-left">
                  Progresso
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredDemands.map((d: any) => {

                const finished =
                  [
                    "completed",
                    "concluido",
                    "concluído",
                    "finalizado",
                  ].includes(
                    d.status?.toLowerCase()
                  );

                const progress =
                  finished ? 100 : 50;

                return (

                  <tr
                    key={d.id}
                    className="border-t hover:bg-muted/20 transition"
                  >

                    <td className="px-6 py-5">

                      <div>

                        <h3 className="font-semibold">

                          {d.name}

                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">

                          {d.description || "Sem descrição"}

                        </p>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          d.status
                        )}`}
                      >

                        {d.status}

                      </span>

                    </td>

                    <td>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          d.priority
                        )}`}
                      >

                        {d.priority || "-"}

                      </span>

                    </td>

                    <td>

                      {d.delivery_date
                        ? new Date(
                            d.delivery_date
                          ).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}

                    </td>

                    <td className="w-72">

                      <div className="flex items-center gap-4">

                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">

                          <div

                            className="bg-primary h-3 rounded-full transition-all"

                            style={{
                              width: `${progress}%`,
                            }}

                          />

                        </div>

                        <span className="text-sm font-medium">

                          {progress}%

                        </span>

                      </div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        )}

      </div>

    </div>

  </PortalLayout>

);

}