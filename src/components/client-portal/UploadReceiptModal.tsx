import { useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UploadReceiptModalProps {
  open: boolean;
  invoice: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadReceiptModal({
  open,
  invoice,
  onClose,
  onSuccess,
}: UploadReceiptModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!open || !invoice) return null;

  async function uploadReceipt() {
    if (!file) {
      alert("Selecione um comprovante.");
      return;
    }

    try {
      setLoading(true);

      const extension = file.name.split(".").pop();

      const fileName = `${invoice.id}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("PAYMENT-RECEIPTS")
        .update({

    receipt_url: publicUrl,

    receipt_sent_at: new Date().toISOString(),

    status: "awaiting_confirmation",

    confirmation_status: "waiting_confirmation",

})
        .eq("id", invoice.id);

      if (updateError) throw updateError;

      alert("Comprovante enviado com sucesso!");

      onSuccess?.();

      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">

      <div className="bg-background rounded-xl w-full max-w-lg shadow-xl">

        <div className="flex justify-between items-center border-b p-6">

          <div>

            <h2 className="text-xl font-bold">

              Enviar comprovante

            </h2>

            <p className="text-muted-foreground text-sm mt-1">

              Após realizar o pagamento envie seu comprovante.

            </p>

          </div>

          <button onClick={onClose}>

            <X />

          </button>

        </div>

        <div className="p-6 space-y-6">

          <div>

            <p className="text-sm text-muted-foreground">

              Valor

            </p>

            <h2 className="text-3xl font-bold">

              {Number(invoice.amount).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                }
              )}

            </h2>

          </div>

          <div className="border rounded-xl p-5">

            <label className="font-medium">

              Selecione o comprovante

            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="mt-4 block w-full"
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                }
              }}
            />

            {file && (
              <p className="text-sm mt-3 text-muted-foreground">

                {file.name}

              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">

            <p className="text-sm">

              Após o envio a agência analisará seu comprovante.
              Quando aprovado o pagamento será marcado automaticamente
              como <strong>Pago</strong>.

            </p>

          </div>

          <button
            disabled={loading}
            onClick={uploadReceipt}
            className="w-full h-12 rounded-lg bg-green-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Upload size={18} />

            {loading
              ? "Enviando..."
              : "Enviar comprovante"}
          </button>

        </div>

      </div>

    </div>
  );
}