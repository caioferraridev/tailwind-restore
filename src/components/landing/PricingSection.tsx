import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const features = [
  "CRM completo",
  "Gestão de Clientes",
  "Leads",
  "Demandas",
  "Ordens de Serviço",
  "Agenda Integrada",
  "Financeiro",
  "Portal do Cliente",
  "Relatórios",
  "Automações com IA",
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="container mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Plano Único
          </span>

          <h2 className="mt-4 text-4xl font-bold">
            Tudo o que sua agência precisa.
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Um único plano, sem limitações artificiais.
            Você paga apenas <strong>R$ 49,90/mês</strong> para utilizar toda a
            plataforma.
          </p>
        </div>

        <div className="mx-auto max-w-xl rounded-3xl border bg-card shadow-xl p-10">

          <div className="text-center">

            <h3 className="text-3xl font-bold">
              Growth
            </h3>

            <div className="mt-6">

              <span className="text-6xl font-bold">
                R$49
              </span>

              <span className="text-2xl font-semibold">
                ,90
              </span>

              <p className="text-muted-foreground mt-2">
                por mês
              </p>

            </div>

          </div>

          <div className="my-10 space-y-4">

            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3"
              >
                <Check className="h-5 w-5 text-green-500" />

                <span>{feature}</span>

              </div>
            ))}

          </div>

          <Button
            asChild
            size="lg"
            className="w-full text-lg h-14"
          >
            <Link to="/signup">
              Começar por R$ 49,90
            </Link>
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sem fidelidade.
            Cancele quando quiser.
          </p>

        </div>

      </div>
    </section>
  );
}