import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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

    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    async function handleUpload() {

        if (!file || !invoice) return;

        setLoading(true);

        try {

            const extension = file.name.split(".").pop();

            const filename = `${invoice.id}-${Date.now()}.${extension}`;

            const path = `${invoice.client_id}/${filename}`;

            const { error: uploadError } = await supabase.storage

                .from("payment-receipts")

                .upload(path, file, {

                    upsert: true,

                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage

                .from("payment-receipts")

                .getPublicUrl(path);

            const receiptUrl = data.publicUrl;

            const { error: updateError } = await supabase

                .from("finance_transactions")

                .update({

                    receipt_url: receiptUrl,

                    receipt_sent_at: new Date().toISOString(),

                    status: "awaiting_confirmation",

                })

                .eq("id", invoice.id);

            if (updateError) throw updateError;

            setLoading(false);

            setFile(null);

            onSuccess?.();

            onClose();

        } catch (err) {

            console.error(err);

            alert("Erro ao enviar comprovante.");

            setLoading(false);

        }

    }

    return (

        <Dialog

            open={open}

            onOpenChange={onClose}

        >

            <DialogContent className="sm:max-w-lg">

                <DialogHeader>

                    <DialogTitle>

                        Enviar comprovante

                    </DialogTitle>

                    <DialogDescription>

                        Faça upload do comprovante PIX ou boleto pago.

                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-4 py-3">

                    <input

                        type="file"

                        accept="image/*,.pdf"

                        onChange={(e) => {

                            if (e.target.files?.length) {

                                setFile(e.target.files[0]);

                            }

                        }}

                        className="w-full border rounded-lg p-3"

                    />

                    {file && (

                        <div className="rounded-lg bg-muted p-3">

                            <p className="font-medium">

                                {file.name}

                            </p>

                            <p className="text-sm text-muted-foreground">

                                {(file.size / 1024 / 1024).toFixed(2)} MB

                            </p>

                        </div>

                    )}

                </div>

                <DialogFooter>

                    <Button

                        variant="outline"

                        onClick={onClose}

                        disabled={loading}

                    >

                        Cancelar

                    </Button>

                    <Button

                        onClick={handleUpload}

                        disabled={!file || loading}

                    >

                        {loading

                            ? "Enviando..."

                            : "Enviar comprovante"}

                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}