import { useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";
import { generateTemporaryPassword } from "@/lib/password";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  onCreated?: () => void;
};

export default function InviteClientDialog({
  open,
  onClose,
  clientId,
  onCreated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [role, setRole] = useState("viewer");

  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setPassword(generateTemporaryPassword());
    }
  }, [open]);

  async function handleCreate() {
    try {
      setLoading(true);

      const passwordHash = await bcrypt.hash(password, 10);

      const { error } = await supabase.from("client_users").insert({
        client_id: clientId,
        full_name: fullName,
        email,
        password_hash: passwordHash,
        role,
        active: true,
        invitation_sent_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Cliente convidado com sucesso!");

      onCreated?.();

      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>Convidar Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <Label>Nome</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Permissão</Label>

            <Select
              value={role}
              onValueChange={setRole}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="viewer">
                  Visualizador
                </SelectItem>

                <SelectItem value="admin">
                  Administrador
                </SelectItem>
              </SelectContent>

            </Select>
          </div>

          <div>
            <Label>Senha Temporária</Label>

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Criando..." : "Gerar Convite"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}