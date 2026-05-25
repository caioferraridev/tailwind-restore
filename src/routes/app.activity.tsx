import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/app/activity")({ component: ActivityPage });

function ActivityPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
        <p className="text-sm text-muted-foreground mt-1">Histórico de ações da equipe</p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        : logs.length === 0 ? (
          <div className="p-16 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((l) => (
              <div key={l.id} className="p-4 flex items-start gap-3 hover:bg-muted/30">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{l.action}</span>
                    {l.entity_type && <span className="text-muted-foreground"> · {l.entity_type}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
