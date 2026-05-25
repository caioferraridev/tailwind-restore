import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, HeadContent, Scripts,
} from "@tanstack/react-router";
import "../styles.css";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Azas — CRM da Agência" },
      { name: "description", content: "Sistema interno de gestão da agência Azas." },
      { property: "og:title", content: "Azas — CRM da Agência" },
      { name: "twitter:title", content: "Azas — CRM da Agência" },
      { property: "og:description", content: "Sistema interno de gestão da agência Azas." },
      { name: "twitter:description", content: "Sistema interno de gestão da agência Azas." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4700c09-6d5b-433a-8270-06441e1ff951/id-preview-f233b4ff--8fb4043b-d2c3-4b9e-ab57-9c9f605aa9b7.lovable.app-1778609293041.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4700c09-6d5b-433a-8270-06441e1ff951/id-preview-f233b4ff--8fb4043b-d2c3-4b9e-ab57-9c9f605aa9b7.lovable.app-1778609293041.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
