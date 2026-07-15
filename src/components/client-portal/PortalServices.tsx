import {
  BadgeCheck,
  Calendar,
  DollarSign,
} from "lucide-react";

type Service = {
  id: string;
  monthly_value: number;
  start_date: string | null;
  end_date: string |null;
  status: string;
  notes: string | null;

  services?: {
    name: string;
    description?: string;
  };
};

type Props = {
  services: Service[];
};

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "ativo":
      return "bg-green-100 text-green-700";

    case "paused":
    case "pausado":
      return "bg-yellow-100 text-yellow-700";

    case "finished":
    case "finalizado":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function PortalServices({
  services,
}: Props) {

  return (

    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="border-b p-6">

        <h2 className="text-xl font-semibold">
          Serviços Contratados
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Tudo o que está incluso no seu contrato.
        </p>

      </div>

      {services.length === 0 ? (

        <div className="p-12 text-center text-muted-foreground">

          Nenhum serviço contratado.

        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-5 p-6">

          {services.map((service) => (

            <div
              key={service.id}
              className="rounded-xl border p-6 hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold text-lg">

                    {service.services?.name || "Serviço"}

                  </h3>

                  <p className="text-sm text-muted-foreground">

                    {service.services?.description || "-"}

                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                    service.status
                  )}`}
                >
                  {service.status}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">

                <div className="flex gap-2">

                  <DollarSign
                    size={18}
                    className="text-primary mt-1"
                  />

                  <div>

                    <p className="text-xs text-muted-foreground">

                      Mensalidade

                    </p>

                    <p className="font-semibold">

                      R$ {Number(
                        service.monthly_value
                      ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}

                    </p>

                  </div>

                </div>

                <div className="flex gap-2">

                  <Calendar
                    size={18}
                    className="text-primary mt-1"
                  />

                  <div>

                    <p className="text-xs text-muted-foreground">

                      Início

                    </p>

                    <p className="font-semibold">

                      {service.start_date
                        ? new Date(
                            service.start_date
                          ).toLocaleDateString("pt-BR")
                        : "-"}

                    </p>

                  </div>

                </div>

                <div className="flex gap-2">

                  <Calendar
                    size={18}
                    className="text-primary mt-1"
                  />

                  <div>

                    <p className="text-xs text-muted-foreground">

                      Término

                    </p>

                    <p className="font-semibold">

                      {service.end_date
                        ? new Date(
                            service.end_date
                          ).toLocaleDateString("pt-BR")
                        : "Indeterminado"}

                    </p>

                  </div>

                </div>

                <div className="flex gap-2">

                  <BadgeCheck
                    size={18}
                    className="text-primary mt-1"
                  />

                  <div>

                    <p className="text-xs text-muted-foreground">

                      Situação

                    </p>

                    <p className="font-semibold">

                      {service.status}

                    </p>

                  </div>

                </div>

              </div>

              {service.notes && (

                <div className="mt-6 rounded-lg bg-muted/30 p-4">

                  <p className="text-sm">

                    {service.notes}

                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

}