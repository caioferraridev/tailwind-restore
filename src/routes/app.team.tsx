import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/team")({ component: TeamPage });

function TeamPage() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      return (profiles || []).map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.id)?.role || "user",
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
        <p className="text-sm text-muted-foreground mt-1">{members.length} membro(s) na empresa</p>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm">
          <strong>Convite de novos membros:</strong> compartilhe o link <code className="px-1.5 py-0.5 rounded bg-muted text-xs">/signup</code> com seus colaboradores. Eles devem usar o mesmo nome de empresa cadastrado para entrar no seu workspace (em breve: convites por email com permissões).
        </p>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        : members.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">Nenhum membro.</div>
        : (
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {(m.full_name || m.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{m.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <Badge variant={m.role === "admin" ? "default" : "secondary"} className="capitalize">
                  <Users className="h-3 w-3 mr-1" />{m.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
