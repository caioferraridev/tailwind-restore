export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            A
          </div>
          <span className="font-semibold tracking-tight text-sm">Azas</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sistema Azas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
