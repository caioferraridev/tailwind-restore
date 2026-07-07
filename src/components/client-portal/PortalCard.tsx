import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import InviteClientDialog from "./InviteClientDialog";

type Props = {
  clientId: string;
};

export default function PortalCard({ clientId }: Props) {

  const queryClient = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["client-users", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_users")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data ?? [];
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Portal do Cliente
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários que terão acesso ao portal deste cliente.
          </p>
        </div>

        <Badge variant={users.length > 0 ? "default" : "secondary"}>
          {users.length > 0 ? "Portal Ativado" : "Portal Não Ativado"}
        </Badge>
      </div>

      <div className="border rounded-lg p-5 flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            Usuários cadastrados
          </h3>

          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `${users.length} usuário(s)`}
          </p>
        </div>

        <Button onClick={() => setInviteOpen(true)}>
    Convidar Cliente
</Button>
      </div>

      {!isLoading && users.length > 0 && (
        <div className="border rounded-lg divide-y">
          {users.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium">
                  {user.full_name || "Sem nome"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <Badge
                variant={
                  user.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {user.status === "active"
                  ? "Ativo"
                  : "Pendente"}
              </Badge>
            </div>
          ))}
        </div>
      )}
      <InviteClientDialog
  open={inviteOpen}
  onClose={() => setInviteOpen(false)}
  clientId={clientId}
/>

<InviteClientDialog
    open={inviteOpen}
    onClose={() => setInviteOpen(false)}
    clientId={clientId}
    onCreated={() =>
        queryClient.invalidateQueries({
            queryKey: ["client-users", clientId],
        })
    }
/>
    </Card>
  );
}