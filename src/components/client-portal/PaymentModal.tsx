import { useState } from "react";
import { X, Copy, CreditCard, QrCode } from "lucide-react";

import UploadReceiptModal from "./UploadReceiptModal";

interface PaymentModalProps {
  open: boolean;
  invoice: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentModal({
  open,
  invoice,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "boleto"
  >("pix");

  const [uploadOpen, setUploadOpen] = useState(false);

  if (!open || !invoice) return null;

  // Depois vamos puxar isso automaticamente da empresa
  const pixKey = "financeiro@empresa.com.br";

  const copyPix = async () => {
    await navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada.");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

        <div className="bg-background rounded-xl shadow-xl w-full max-w-xl">

          {/* Header */}

          <div className="flex justify-between items-center border-b p-6">

            <div>

              <h2 className="text-2xl font-bold">

                Pagamento

              </h2>

              <p className="text-sm text-muted-foreground mt-1">

                Escolha a forma de pagamento.

              </p>

            </div>

            <button onClick={onClose}>

              <X />

            </button>

          </div>

          {/* Conteúdo */}

          <div className="space-y-6 p-6">

            <div>

              <p className="text-sm text-muted-foreground">

                Valor da cobrança

              </p>

              <h2 className="text-4xl font-bold mt-2">

                {Number(invoice.amount).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </h2>

            </div>

            {/* Seleção */}

            <div className="grid grid-cols-2 gap-4">

              <button
                onClick={() => setPaymentMethod("pix")}
                className={`rounded-xl border p-5 transition ${
                  paymentMethod === "pix"
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >

                <QrCode
                  className="mx-auto mb-3"
                  size={32}
                />

                <p className="font-semibold">

                  PIX

                </p>

              </button>

              <button
                onClick={() => setPaymentMethod("boleto")}
                className={`rounded-xl border p-5 transition ${
                  paymentMethod === "boleto"
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >

                <CreditCard
                  className="mx-auto mb-3"
                  size={32}
                />

                <p className="font-semibold">

                  Boleto

                </p>

              </button>

            </div>

            {/* PIX */}

            {paymentMethod === "pix" && (

              <div className="rounded-xl border p-5">

                <h3 className="font-semibold">

                  Chave PIX

                </h3>

                <p className="break-all mt-3">

                  {pixKey}

                </p>

                <button
                  onClick={copyPix}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                >

                  <Copy size={18} />

                  Copiar chave

                </button>

              </div>

            )}

            {/* BOLETO */}

            {paymentMethod === "boleto" && (

              <div className="rounded-xl border p-5">

                <h3 className="font-semibold">

                  Boleto

                </h3>

                <p className="text-sm text-muted-foreground mt-2">

                  Quando houver boleto cadastrado pela agência,
                  ele aparecerá aqui para download.

                </p>

                <button
                  className="mt-5 rounded-lg border px-4 py-2"
                  disabled
                >

                  Download do boleto

                </button>

              </div>

            )}

            {/* Aviso */}

            <div className="rounded-xl bg-muted p-5">

              <p className="text-sm">

                Após realizar o pagamento clique abaixo para enviar
                seu comprovante.

              </p>

            </div>

            {/* Botões */}

            <div className="flex gap-4">

              <button
                onClick={onClose}
                className="flex-1 rounded-lg border h-11"
              >

                Fechar

              </button>

              <button
                onClick={() => setUploadOpen(true)}
                className="flex-1 rounded-lg bg-green-600 text-white h-11 font-semibold"
              >

                Já realizei o pagamento

              </button>

            </div>

          </div>

        </div>

      </div>

      <UploadReceiptModal
        open={uploadOpen}
        invoice={invoice}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          onClose();
          onSuccess?.();
        }}
      />
    </>
  );
}