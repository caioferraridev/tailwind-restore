import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            A
          </div>
          <span className="font-semibold tracking-tight">Azas</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#modulos" className="hover:text-foreground transition-colors">
            Módulos
          </a>
          <a href="#produto" className="hover:text-foreground transition-colors">
            Produto
          </a>
          <a href="#diferenciais" className="hover:text-foreground transition-colors">
            Diferenciais
          </a>
        </nav>

        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
