import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());

  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  const { data: events = [] } = useQuery({
    queryKey: ["calendar", cursor.getMonth(), cursor.getFullYear()],
    queryFn: async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*, clients(company_name)")
        .gte("start_at", start.toISOString())
        .lte("start_at", end.toISOString())
        .order("start_at");
      return data || [];
    },
  });

  // Build calendar grid
  const firstDay = start.getDay();
  const daysInMonth = end.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (date: Date) =>
    events.filter((e: any) => {
      const d = new Date(e.start_at);
      return d.toDateString() === date.toDateString();
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">Agenda geral da agência</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold capitalize">
            {cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="bg-muted py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{d}</div>
          ))}
          {cells.map((date, i) => {
            const isToday = date && date.toDateString() === new Date().toDateString();
            const dayEvents = date ? eventsForDay(date) : [];
            return (
              <div key={i} className={`bg-card min-h-[100px] p-2 ${!date ? "opacity-30" : ""}`}>
                {date && (
                  <>
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e: any) => (
                        <div key={e.id} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate">
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
