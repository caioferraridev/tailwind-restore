import { useRef, useState } from "react";
import { Users, TrendingUp, CalendarDays, ListChecks } from "lucide-react";

export default function HeroVisual() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className="relative mx-auto max-w-3xl [perspective:1400px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes azas-float-a { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes azas-float-b { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes azas-float-c { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* Browser frame */}
      <div
        ref={frameRef}
        className="relative rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)] overflow-hidden transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <div className="ml-3 flex-1 rounded-md bg-background/80 border border-border px-3 py-1 text-xs text-muted-foreground">
            app.azas.com/dashboard
          </div>
        </div>

        <div className="relative h-[360px] bg-gradient-to-br from-muted/30 to-background p-6">
          {/* faint grid backdrop */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Clientes panel */}
          <div
            className="absolute left-6 top-6 w-52 rounded-xl border border-border bg-card/90 backdrop-blur-sm p-4 shadow-[var(--shadow-card)]"
            style={{ animation: "azas-float-a 6s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              Clientes ativos
            </div>
            <p className="text-2xl font-bold tracking-tight">128</p>
            <div className="mt-3 flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-card bg-primary/20"
                />
              ))}
            </div>
          </div>

          {/* Financeiro panel */}
          <div
            className="absolute right-6 top-14 w-56 rounded-xl border border-border bg-card/90 backdrop-blur-sm p-4 shadow-[var(--shadow-card)]"
            style={{ animation: "azas-float-b 7s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Receita do mês
            </div>
            <p className="text-2xl font-bold tracking-tight">R$ 84.230</p>
            <div className="mt-3 flex items-end gap-1 h-10">
              {[40, 60, 35, 70, 55, 90, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/25"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Demandas panel */}
          <div
            className="absolute left-10 bottom-6 w-60 rounded-xl border border-border bg-card/90 backdrop-blur-sm p-4 shadow-[var(--shadow-card)]"
            style={{ animation: "azas-float-c 8s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5 text-primary" />
              Demandas
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Revisão de campanha — Cliente A
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Entrega de relatório — Cliente B
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Post aprovado — Cliente C
              </div>
            </div>
          </div>

          {/* Agenda panel */}
          <div
            className="absolute right-10 bottom-10 w-44 rounded-xl border border-border bg-card/90 backdrop-blur-sm p-4 shadow-[var(--shadow-card)]"
            style={{ animation: "azas-float-a 6.5s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Agenda
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-sm ${
                    i === 12 ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
    </div>
  );
}
