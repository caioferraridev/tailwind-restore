import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Bem-vindo de volta!");

    nav({ to: "/app" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* Lado esquerdo */}

      <div className="hidden lg:flex flex-col justify-center p-16 bg-muted/30 border-r">

        <Badge className="w-fit mb-6">
          Plano Growth • R$ 49,90/mês
        </Badge>

        <h1 className="text-5xl font-bold leading-tight max-w-xl">
          Gerencie toda sua agência em um único sistema.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-lg">
          CRM, clientes, demandas, financeiro, equipe, calendário,
          automações e muito mais.
        </p>

        <div className="mt-10 space-y-4">

          {[
            "CRM completo",
            "20 clientes ativos",
            "Ordens de Serviço",
            "Financeiro integrado",
            "Calendário inteligente",
            "1000 créditos de IA",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>{item}</span>
            </div>
          ))}

        </div>

      </div>

      {/* Lado direito */}

      <div className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <Link
            to="/"
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
              style={{
                background: "var(--gradient-primary)",
              }}
            >
              A
            </div>

            <span className="font-semibold text-xl">
              Azas
            </span>
          </Link>

          <Card className="p-8 shadow-[var(--shadow-elegant)]">

            <h2 className="text-3xl font-bold">
              Entrar
            </h2>

            <p className="text-muted-foreground mt-2 mb-8">
              Acesse sua conta para continuar.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>

                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

            </form>

            <div className="mt-8 border-t pt-6">

              <p className="text-center text-sm text-muted-foreground">
                Ainda não possui uma conta?
              </p>

              <Button
                asChild
                variant="default"
                className="w-full mt-4"
              >
                <Link to="/signup">
                  Criar conta por R$ 49,90/mês
                </Link>
              </Button>

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
}