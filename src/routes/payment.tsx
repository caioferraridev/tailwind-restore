import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
});

function PaymentPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12">

        {/* Lado esquerdo */}

        <div className="flex flex-col justify-center">

          <h1 className="text-5xl font-bold leading-tight">
            Plataforma Azas
          </h1>

          <p className="mt-4 text-xl text-muted-foreground">
            Tudo que sua agência precisa para crescer em um único sistema.
          </p>

          <div className="mt-10 space-y-5">

            <Item text="CRM completo" />
            <Item text="Gestão financeira" />
            <Item text="Demandas e projetos" />
            <Item text="Calendário inteligente" />
            <Item text="Portal do Cliente (em breve)" />
            <Item text="Automações IA" />
            <Item text="Ordens de Serviço" />

          </div>

        </div>

        {/* Card */}

        <Card className="p-10 shadow-xl">

          <div className="text-center">

            <p className="text-primary font-semibold uppercase">
              Plano Growth
            </p>

            <h2 className="text-6xl font-bold mt-3">
              R$ 49,90
            </h2>

            <p className="text-muted-foreground">
              por mês
            </p>

          </div>

          <div className="my-8 border-t" />

          <div className="space-y-4">

            <Item text="1 usuário" />
            <Item text="20 clientes" />
            <Item text="1000 créditos IA" />
            <Item text="Atualizações gratuitas" />
            <Item text="Suporte prioritário" />

          </div>

          <Button
            className="w-full mt-10 h-12 text-lg"
          >
            Assinar agora
          </Button>

          <div className="mt-6 flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Pagamento seguro
          </div>

        </Card>

      </div>
    </div>
  );
}

function Item({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Check className="text-green-500 w-5 h-5" />
      <span>{text}</span>
    </div>
  );
}