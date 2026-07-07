import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/portal/login")({
  component: PortalLogin,
});

function PortalLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">

      <Card className="w-[420px] p-8 space-y-6">

        <div>

          <h1 className="text-2xl font-bold">
            Portal do Cliente
          </h1>

          <p className="text-muted-foreground">
            Faça login para acompanhar seu projeto.
          </p>

        </div>

        <Input placeholder="Email" />

        <Input
          placeholder="Senha"
          type="password"
        />

        <Button className="w-full">
          Entrar
        </Button>

      </Card>

    </div>
  );
}