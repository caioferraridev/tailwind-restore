import { Button } from "@/components/ui/button";
import { useState } from "react";
import UploadReceiptDialog from "./UploadReceiptDialog";

type Props = {
  payment: any;
  onSendReceipt: (payment: any) => void;
};

function getStatus(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";

    case "waiting_confirmation":
      return "bg-yellow-100 text-yellow-700";

    case "overdue":
      return "bg-red-100 text-red-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function PaymentCard({
  payment,
  onSendReceipt,
}: Props) {
  return (
    <div className="rounded-xl border p-6 space-y-5">

      <div className="flex justify-between items-start">

        <div>

          <h3 className="text-lg font-semibold">
            {payment.description}
          </h3>

          <p className="text-sm text-muted-foreground">
            Vencimento:
            {" "}
            {payment.due_date
              ? new Date(payment.due_date).toLocaleDateString("pt-BR")
              : "-"}
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatus(
            payment.confirmation_status
          )}`}
        >
          {payment.confirmation_status}
        </span>

      </div>

      <div className="text-4xl font-bold text-primary">

        {Number(payment.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        

      </div>

      <div className="space-y-2">

        <p className="text-sm font-medium">
          Chave PIX
        </p>

        <div className="rounded-lg bg-muted p-3 text-sm break-all">

          {payment.pix_key || "PIX ainda não configurado"}

        </div>

      </div>

      <div className="flex gap-3">

        <Button
          variant="outline"
          onClick={() =>
            navigator.clipboard.writeText(payment.pix_key || "")
          }
        >
          Copiar PIX
        </Button>

        <Button
  onClick={() => setOpen(true)}
>
  Já realizei o pagamento
</Button>

      </div>
<UploadReceiptDialog
    open={open}
    onClose={() => setOpen(false)}
    payment={payment}
/>
    </div>
  );
}
const [open, setOpen] = useState(false);