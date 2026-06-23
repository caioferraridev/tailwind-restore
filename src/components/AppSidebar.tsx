import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ListChecks,
  Calendar,
  ClipboardList,
  Target,
  DollarSign,
  Settings,
  LogOut,
  BarChart3,
  Sparkles,
  UserCog,
  Activity
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Clientes", url: "/app/clients", icon: Users },
  { title: "Leads", url: "/app/leads", icon: Sparkles },
  { title: "Serviços", url: "/app/services", icon: Briefcase },
  { title: "Demandas", url: "/app/demands", icon: ListChecks },

  {
    title: "Ordens de Serviço",
    url: "/app/service-orders",
    icon: ClipboardList,
  },

  { title: "Calendário", url: "/app/calendar", icon: Calendar },
];

const secondaryItems = [
  { title: "Financeiro", url: "/app/finance", icon: DollarSign },
  { title: "Metas", url: "/app/goals", icon: Target },
  { title: "Relatórios", url: "/app/reports", icon: BarChart3 },
  { title: "Equipe", url: "/app/team", icon: UserCog },
  { title: "Atividades", url: "/app/activity", icon: Activity },
  { title: "Configurações", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({
    select: (r) => r.location.pathname,
  });

  const { signOut, profile } = useAuth();

  const isActive = (url: string) =>
    path === url ||
    (url !== "/app" && path.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0"
            style={{
              background: "var(--gradient-primary)",
            }}
          >
            A
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sidebar-foreground text-sm">
                Azas
              </span>

              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                Agency CRM
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel>
              Principal
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel>
              Gestão
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && profile && (
          <div className="px-2 py-1.5 mb-2">
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {profile.full_name || profile.email}
            </div>

            <div className="text-[10px] text-sidebar-foreground/50 truncate">
              {profile.email}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />

          {!collapsed && (
            <span className="ml-2">
              Sair
            </span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}