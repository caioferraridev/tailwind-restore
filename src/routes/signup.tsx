import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const nav = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: {
          company_name: companyName,
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Conta criada com sucesso!");

nav({
  to: "/payment",
});
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-10 w-full max-w-6xl">

        {/* FORMULÁRIO */}

        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft size={16} />
            Já possui uma conta?
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: "var(--gradient-primary)",
              }}
            >
              A
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Sistema Azas
              </h2>

              <p className="text-muted-foreground text-sm">
                Plataforma para Agências
              </p>
            </div>
          </div>

          <Card className="p-8 shadow-[var(--shadow-elegant)]">

            <h1 className="text-3xl font-bold">
              Criar Conta
            </h1>

            <p className="text-muted-foreground mt-2 mb-8">
              Comece agora mesmo. Em menos de 2 minutos sua agência estará pronta.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="space-y-2">
                <Label>Nome da Agência</Label>

                <Input
                  required
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Seu Nome</Label>

                <Input
                  required
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>

                <Input
                  type="password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              <Button
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading
                  ? "Criando conta..."
                  : "Criar Conta"}
              </Button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                Ao criar sua conta você concorda com nossos Termos de Uso.
              </p>

            </form>
          </Card>
        </div>

        {/* RESUMO DO PLANO */}

        <div className="flex items-center">

          <Card className="w-full p-10 border-2 border-primary shadow-xl">

            <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold mb-5">
              Growth
            </div>

            <h2 className="text-4xl font-bold mb-2">
              R$ 49,90
            </h2>

            <p className="text-muted-foreground mb-8">
              por mês
            </p>

            <div className="space-y-4">

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  Até <strong>20 clientes</strong>
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  CRM completo
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  Gestão de Demandas
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  Financeiro integrado
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  Calendário inteligente
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  Portal do Cliente (em breve)
                </span>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="text-primary mt-1" />
                <span>
                  1.000 créditos de IA
                </span>
              </div>

            </div>

            <div className="border-t mt-8 pt-8 space-y-4">

              <div className="flex items-center gap-3">
                <CreditCard
                  className="text-primary"
                  size={18}
                />

                <span className="text-sm">
                  Cobrança recorrente mensal
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="text-primary"
                  size={18}
                />

                <span className="text-sm">
                  Cancelamento quando desejar
                </span>
              </div>

            </div>

          </Card>

        </div>

      </div>
    </div>
  );
}