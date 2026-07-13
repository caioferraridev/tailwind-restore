import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PaymentCard from "@/components/client-portal/PaymentCard";

export const Route = createFileRoute("/portal/payments")({
  component: PortalPayments,
});

function PortalPayments() {
  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const { data: finance = [], isLoading } = useQuery<any[]>({
    queryKey: ["portal-finance", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("client_id", clientId)
        .order("due_date", { ascending: true });

      if (error) throw error;

      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Financeiro
        </h1>

        <p className="text-muted-foreground">
          Acompanhe seus pagamentos e envie comprovantes.
        </p>
      </div>

      {finance.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          Nenhum pagamento encontrado.
        </div>
      ) : (
        <div className="grid gap-6">
          {finance.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onSendReceipt={(payment) => {
                console.log(payment);
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}