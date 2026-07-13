import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useMemo, useState } from "react";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";
import PaymentModal from "@/components/client-portal/PaymentModal";
export const Route = createFileRoute("/portal/finance")({
  component: PortalFinancePage,
});

function getStatusColor(status?: string) {

  switch (status?.toLowerCase()) {

    case "paid":
    case "pago":
      return "bg-green-100 text-green-700";

    case "pending":
    case "pendente":
      return "bg-yellow-100 text-yellow-700";

    case "awaiting_confirmation":
      return "bg-blue-100 text-blue-700";

    case "late":
    case "atrasado":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";

  }

}

export default function PortalFinancePage() {

  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] =
  useState<any>(null);

const [paymentOpen, setPaymentOpen] =
  useState(false);

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

  const {
  data: invoices = [],
  refetch,
} = useQuery<any[]>({

  queryKey: ["portal-finance", clientId],

  enabled: !!clientId,

  queryFn: async () => {

    const { data, error } = await supabase

      .from("finance_transactions")

      .select("*")

      .eq("client_id", clientId)

      .order("due_date");

    if (error) throw error;

    return data ?? [];

  },

});

  const filteredInvoices = useMemo(() => {

    return invoices.filter((invoice) =>

      invoice.description
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [search, invoices]);

  const totalOpen = invoices
    .filter(i => i.status !== "paid")
    .reduce((a,b)=>a+Number(b.amount),0);

  const totalPaid = invoices
    .filter(i=>i.status==="paid")
    .reduce((a,b)=>a+Number(b.amount),0);

  const nextInvoice = invoices.find(
    i=>i.status!=="paid"
  );

  return (

    <PortalLayout>

      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name}
        />

        <div>

          <h2 className="text-3xl font-bold">

            Financeiro

          </h2>

          <p className="text-muted-foreground mt-2">

            Controle completo das suas cobranças e pagamentos.

          </p>

        </div>
                {/* Cards */}

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Em Aberto

            </p>

            <h2 className="text-3xl font-bold mt-3 text-red-600">

              {totalOpen.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}

            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Total Pago

            </p>

            <h2 className="text-3xl font-bold mt-3 text-green-600">

              {totalPaid.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}

            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Próximo Vencimento

            </p>

            <h2 className="text-xl font-bold mt-3">

              {nextInvoice?.due_date
                ? new Date(
                    nextInvoice.due_date
                  ).toLocaleDateString("pt-BR")
                : "Nenhum"}

            </h2>

          </div>

        </div>

        {/* Pesquisa */}

        <div className="rounded-xl border p-6">

          <input

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            placeholder="Pesquisar cobrança..."

            className="border rounded-lg px-4 h-11 w-full bg-background"

          />

        </div>

        {/* Lista */}

        <div className="rounded-xl border overflow-hidden">

          <div className="border-b p-6">

            <h3 className="text-xl font-semibold">

              Cobranças

            </h3>

            <p className="text-sm text-muted-foreground mt-1">

              Visualize, pague e envie comprovantes das suas faturas.

            </p>

          </div>

          {filteredInvoices.length === 0 ? (

            <div className="p-12 text-center text-muted-foreground">

              Nenhuma cobrança encontrada.

            </div>

          ) : (

            <div className="divide-y">

              {filteredInvoices.map((invoice: any) => (

                <div
                  key={invoice.id}
                  className="p-6 hover:bg-muted/20 transition"
                >

                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                    <div className="space-y-3">

                      <div className="flex items-center gap-3">

                        <h3 className="text-xl font-semibold">

                          {invoice.description || "Cobrança"}

                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>

                      </div>

                      <div className="grid md:grid-cols-4 gap-6 mt-4">

                        <div>

                          <p className="text-xs uppercase text-muted-foreground">

                            Valor

                          </p>

                          <p className="font-bold text-xl mt-1">

                            {Number(invoice.amount).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              }
                            )}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase text-muted-foreground">

                            Vencimento

                          </p>

                          <p className="font-medium mt-1">

                            {invoice.due_date
                              ? new Date(
                                  invoice.due_date
                                ).toLocaleDateString("pt-BR")
                              : "-"}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase text-muted-foreground">

                            Forma de Pagamento

                          </p>

                          <p className="font-medium mt-1">

                            {invoice.payment_method || "PIX"}

                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase text-muted-foreground">

                            Categoria

                          </p>

                          <p className="font-medium mt-1">

                            {invoice.category || "-"}

                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-3">

                      {invoice.status !== "paid" && (

                        <button

className="px-5 py-2 rounded-lg bg-primary text-primary-foreground"

onClick={() => {

    setSelectedInvoice(invoice);

    setPaymentOpen(true);

}}

>

Pagar

</button>
                      )}

                      {invoice.status === "awaiting_confirmation" && (

                        <div className="px-5 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium">

                          Comprovante enviado

                        </div>

                      )}

                      {invoice.status === "paid" && (

                        <div className="px-5 py-2 rounded-lg bg-green-100 text-green-700 font-medium">

                          Pagamento confirmado

                        </div>

                      )}

                    </div>

                  </div>

                  {invoice.notes && (

                    <div className="mt-6 rounded-lg bg-muted/40 p-4">

                      <p className="text-xs uppercase text-muted-foreground mb-2">

                        Observações

                      </p>

                      <p>

                        {invoice.notes}

                      </p>

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    <PaymentModal
    open={paymentOpen}
    invoice={selectedInvoice}
    onClose={() => {

        setPaymentOpen(false);

        setSelectedInvoice(null);

    }}

    onSuccess={() => {

        refetch();

        setPaymentOpen(false);

        setSelectedInvoice(null);

    }}

/>

    </PortalLayout>

  );

}