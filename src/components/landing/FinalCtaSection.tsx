import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="container mx-auto px-6 pb-24">
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-16 md:py-20 text-center shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
            Transforme sua operação em uma máquina organizada.
          </h2>
          <p className="mt-4 text-primary-foreground/85">
            Clientes, projetos, demandas, equipe e financeiro em um único sistema —
            sem depender de planilhas e mensagens perdidas.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="shadow-[var(--shadow-card)]"
            >
              <Link to="/signup">
                Começar gratuitamente <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
