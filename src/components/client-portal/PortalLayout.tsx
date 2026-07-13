import { ReactNode } from "react";
import PortalSidebar from "./PortalSidebar";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({
  children,
}: PortalLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">

      <PortalSidebar />

      <main className="flex-1 overflow-auto p-8">

        {children}

      </main>

    </div>
  );
}