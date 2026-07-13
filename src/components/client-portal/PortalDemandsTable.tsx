import { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Flag,
  CheckCircle2,
} from "lucide-react";

type Demand = {
  id: string;
  name: string;
  status: string;
  priority: string;
  delivery_date: string | null;
  observations?: string | null;
};

type Props = {
  demands: Demand[];
};

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

export default function PortalDemandsTable({
  demands,
}: Props) {

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {

    if (!search) return demands;

    return demands.filter((d) =>
      d.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [search, demands]);

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="border-b p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h2 className="text-xl font-semibold">
            Demandas
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe todas as atividades da agência.
          </p>

        </div>

        <div className="relative w-full lg:w-96">

          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar demanda..."
            className="
              w-full
              rounded-xl
              border
              pl-10
              pr-4
              py-3
              outline-none
              focus:ring-2
              focus:ring-primary
            "
          />

        </div>

      </div>

      {filtered.length === 0 ? (

        <div className="p-14 text-center text-muted-foreground">

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

            </tr>

          </thead>

          <tbody>

            {filtered.map((d) => (

              <tr
                key={d.id}
                className="
                  border-t
                  hover:bg-muted/30
                  transition
                "
              >

                <td className="px-6 py-5">

                  <div className="space-y-1">

                    <p className="font-semibold">

                      {d.name}

                    </p>

                    <p className="text-sm text-muted-foreground">

                      {d.observations || "Sem observações"}

                    </p>

                  </div>

                </td>

                <td>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${getStatusColor(d.status)}
                    `}
                  >

                    {d.status}

                  </span>

                </td>

                <td>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${getPriorityColor(d.priority)}
                    `}
                  >

                    {d.priority || "-"}

                  </span>

                </td>

                <td>

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    {d.delivery_date
                      ? new Date(
                          d.delivery_date
                        ).toLocaleDateString("pt-BR")
                      : "-"}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

      <div className="border-t bg-muted/20 p-4">

        <div className="flex items-center justify-between">

          <p className="text-sm text-muted-foreground">

            Total de demandas:
            <span className="font-semibold ml-1">
              {filtered.length}
            </span>

          </p>

          <div className="flex gap-6">

            <div className="flex items-center gap-2">

              <CheckCircle2
                size={16}
                className="text-green-600"
              />

              <span className="text-sm">

                {
                  filtered.filter(
                    d =>
                      d.status?.toLowerCase() === "completed" ||
                      d.status?.toLowerCase() === "concluido" ||
                      d.status?.toLowerCase() === "concluído" ||
                      d.status?.toLowerCase() === "finalizado"
                  ).length
                }

                {" "}Concluídas

              </span>

            </div>

            <div className="flex items-center gap-2">

              <Flag
                size={16}
                className="text-red-600"
              />

              <span className="text-sm">

                {
                  filtered.filter(
                    d =>
                      d.priority?.toLowerCase() === "urgent" ||
                      d.priority?.toLowerCase() === "urgente"
                  ).length
                }

                {" "}Urgentes

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}