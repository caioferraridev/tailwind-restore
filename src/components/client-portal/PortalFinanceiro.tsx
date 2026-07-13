import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Receipt,
  Download,
} from "lucide-react";

type Invoice = {
  id: string;
  number?: string | null;
  amount: number;
  due_date: string | null;
  paid_at?: string | null;
  status: string;
  pdf_url?: string | null;
};

type Props = {
  invoices: Invoice[];
};

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "pago":
      return "bg-green-100 text-green-700";

    case "pending":
    case "pendente":
      return "bg-yellow-100 text-yellow-700";

    case "overdue":
    case "atrasado":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PortalFinanceiro({
  invoices,
}: Props) {

  const total = invoices.reduce(
    (acc, invoice) => acc + Number(invoice.amount || 0),
    0
  );

  const paid = invoices.filter(
    (i) =>
      i.status?.toLowerCase() === "paid" ||
      i.status?.toLowerCase() === "pago"
  ).length;

  const pending = invoices.filter(
    (i) =>
      i.status?.toLowerCase() === "pending" ||
      i.status?.toLowerCase() === "pendente"
  ).length;

  const overdue = invoices.filter(
    (i) =>
      i.status?.toLowerCase() === "overdue" ||
      i.status?.toLowerCase() === "atrasado"
  ).length;

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="border-b p-6">

        <h2 className="text-xl font-semibold">
          Financeiro
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Histórico financeiro e mensalidades.
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-5 p-6 border-b">

        <div className="rounded-xl bg-muted/30 p-5">

          <p className="text-sm text-muted-foreground">
            Total
          </p>

          <h2 className="text-3xl font-bold mt-2">
            R$ {total.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h2>

        </div>

        <div className="rounded-xl bg-green-50 p-5">

          <div className="flex items-center gap-2">

            <CheckCircle2
              className="text-green-600"
              size={18}
            />

            <span>Pagas</span>

          </div>

          <h2 className="text-3xl font-bold mt-2">
            {paid}
          </h2>

        </div>

        <div className="rounded-xl bg-yellow-50 p-5">

          <div className="flex items-center gap-2">

            <Clock3
              className="text-yellow-600"
              size={18}
            />

            <span>Pendentes</span>

          </div>

          <h2 className="text-3xl font-bold mt-2">
            {pending}
          </h2>

        </div>

        <div className="rounded-xl bg-red-50 p-5">

          <div className="flex items-center gap-2">

            <AlertTriangle
              className="text-red-600"
              size={18}
            />

            <span>Atrasadas</span>

          </div>

          <h2 className="text-3xl font-bold mt-2">
            {overdue}
          </h2>

        </div>

      </div>

      {invoices.length === 0 ? (

        <div className="p-10 text-center text-muted-foreground">

          Nenhuma fatura encontrada.

        </div>

      ) : (

        <table className="w-full">

          <thead className="bg-muted/40">

            <tr>

              <th className="text-left px-6 py-4">
                Fatura
              </th>

              <th className="text-left">
                Valor
              </th>

              <th className="text-left">
                Vencimento
              </th>

              <th className="text-left">
                Status
              </th>

              <th className="text-right pr-6">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {invoices.map((invoice) => (

              <tr
                key={invoice.id}
                className="border-t hover:bg-muted/20"
              >

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <Receipt
                      size={18}
                      className="text-primary"
                    />

                    <span>

                      {invoice.number || "Fatura"}

                    </span>

                  </div>

                </td>

                <td>

                  R${" "}
                  {Number(invoice.amount).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}

                </td>

                <td>

                  {invoice.due_date
                    ? new Date(
                        invoice.due_date
                      ).toLocaleDateString("pt-BR")
                    : "-"}

                </td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>

                </td>

                <td className="text-right pr-6">

                  <div className="flex justify-end gap-2">

                    <button
                      className="rounded-lg bg-primary text-white px-4 py-2 hover:opacity-90 transition"
                    >
                      Pagar
                    </button>

                    <button
                      className="rounded-lg border px-4 py-2 hover:bg-muted transition"
                    >
                      Enviar comprovante
                    </button>

                    {invoice.pdf_url && (

                      <button
                        onClick={() =>
                          window.open(invoice.pdf_url!, "_blank")
                        }
                        className="rounded-lg border px-4 py-2 hover:bg-primary hover:text-white transition"
                      >
                        <Download size={16} />
                      </button>

                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}