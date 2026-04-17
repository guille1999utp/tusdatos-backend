"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCog,
  CalendarSearch,
  UserCheck,
  Ticket,
  UserCircle,
  LogOut,
  PanelsTopLeft,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { useContext } from "react";
import { AuthContext } from "@/auth/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AppSidebar() {
  const { setOpen, open } = useSidebar();
  const isCollapsed = !open;

  const { user, logout } = useContext(AuthContext)!;

  const handleCloseSidebar = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const menuItems = [
    {
      label: "Panel",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Eventos",
      to: "/events",
      icon: CalendarCog,
    },
    {
      label: "Explorar",
      to: "/all-events",
      icon: CalendarSearch,
    },
    {
      label: "Inscripciones",
      to: "/my-registrations",
      icon: Ticket,
    },
    {
      label: "Asistente",
      to: "/assistant-events",
      icon: UserCheck,
    },
    {
      label: "Perfil",
      to: "/profile",
      icon: UserCircle,
    },

    // 🔥 ADMIN GROUP
    {
      label: "Admin",
      icon: PanelsTopLeft,
      roles: ["admin"],
      children: [
        {
          label: "Dashboard",
          to: "/admin",
        },
        {
          label: "Eventos",
          to: "/admin/events",
        },
        {
          label: "Usuarios",
          to: "/admin/users",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 md:pt-12 pb-4 md:pb-6 text-center bg-background">
        {!isCollapsed ? (
          <Link
            to="/"
            onClick={handleCloseSidebar}
            className="text-3xl font-extrabold text-primary"
          >
            TUSDATOS.CO
          </Link>
        ) : (
          <></>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2 bg-background">
        <NavMain
          items={menuItems}
          user={user}
          onNavigate={handleCloseSidebar}
        />
      </SidebarContent>

      <SidebarFooter className="p-2 md:pb-6 bg-background">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => logout()}
              className={`flex items-center mx-2 font-semibold rounded-2xl h-12 transition-all duration-200 border-2 border-white
        ${isCollapsed ? "justify-center px-0" : "gap-2 pl-4"}
        bg-tertiary text-black hover:bg-tertiary/80 active:scale-95`}
            >
              <LogOut className="size-5" />
              {!isCollapsed && "Cerrar Sesión"}
            </button>
          </TooltipTrigger>

          {isCollapsed && (
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          )}
        </Tooltip>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
