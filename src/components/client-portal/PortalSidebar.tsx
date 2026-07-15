import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    FolderOpen,
    Briefcase,
    Wallet,
    User,
    CircleHelp,
    LogOut,
} from "lucide-react";

import { Link, useRouterState } from "@tanstack/react-router";

const items = [
    {
        title: "Dashboard",
        href: "/portal",
        icon: LayoutDashboard,
    },
    {
        title: "Demandas",
        href: "/portal/demands",
        icon: ClipboardList,
    },
    {
        title: "Agenda",
        href: "/portal/calendar",
        icon: CalendarDays,
    },
    {
        title: "Arquivos",
        href: "/portal/files",
        icon: FolderOpen,
    },
    {
        title: "Serviços",
        href: "/portal/services",
        icon: Briefcase,
    },
    {
        title: "Financeiro",
        href: "/portal/finance",
        icon: Wallet,
    },
    {
        title: "Perfil",
        href: "/portal/profile",
        icon: User,
    },
];

export default function PortalSidebar() {

    const pathname = useRouterState({
        select: (s) => s.location.pathname,
    });

    return (
        <aside className="w-72 border-r bg-background h-screen flex flex-col">

            <div className="p-8 border-b">

                <h1 className="text-3xl font-bold">
                    Azas
                </h1>

                <p className="text-muted-foreground">
                    Portal do Cliente
                </p>

            </div>

            <nav className="flex-1 py-6">

                {items.map((item) => {

                    const Icon = item.icon;

                    const active =
                        pathname === item.href;

                    return (

                        <Link
                            key={item.href}
                            to={item.href}
                            className={`mx-3 mb-1 flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            }`}
                        >
                            <Icon size={20} />

                            {item.title}

                        </Link>

                    );
                })}

            </nav>

            <div className="border-t p-4 space-y-2">

                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted transition">

                    <CircleHelp size={20} />

                    Ajuda

                </button>

                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 hover:bg-red-50 transition">

                    <LogOut size={20} />

                    Sair

                </button>

            </div>

        </aside>
    );
}