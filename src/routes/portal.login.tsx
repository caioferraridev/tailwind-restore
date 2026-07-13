import { useState } from "react";
import bcrypt from "bcryptjs";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

export const Route = createFileRoute("/portal/login")({
  component: PortalLogin,
});

function PortalLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      setLoading(true);

      const { data: user, error } = await supabase
        .from("client_users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !user) {
        toast.error("Usuário não encontrado");
        return;
      }

      if (!user.active) {
        toast.error("Usuário desativado");
        return;
      }

      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!validPassword) {
        toast.error("Senha incorreta");
        return;
      }

      localStorage.setItem(
        "portalUser",
        JSON.stringify(user)
      );

      toast.success("Bem-vindo!");

      navigate({
        to: "/portal",
      });

    } catch (err) {
      console.error(err);

      toast.error("Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

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

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          className="w-full"
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>

      </Card>

    </div>
  );
}