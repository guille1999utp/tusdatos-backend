"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
  const { setOpen, open, isMobile } = useSidebar();
  const isCollapsed = !open && !isMobile;

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
      <SidebarHeader
        className={
          !isCollapsed
            ? "p-4 md:pt-12 pb-4 md:pb-6 text-center bg-background"
            : "p-0"
        }
      >
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

      <SidebarContent
        className={` ${isCollapsed ? "p-5 pt-16" : "p-2"} bg-background`}
      >
        <NavMain
          items={menuItems}
          user={user}
          onNavigate={handleCloseSidebar}
        />
      </SidebarContent>

      <SidebarFooter
        className={` ${isCollapsed ? "p-5 pb-7" : "p-2 pb-7"} bg-background`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => logout()}
              className={`flex cursor-pointer items-center transition-all duration-300 border-2 border-white active:scale-95
        ${
          isCollapsed
            ? "size-12 mx-auto justify-center rounded-2xl"
            : "w-[calc(100%-1rem)] mx-2 h-12 pl-4 rounded-2xl gap-2"
        }
        bg-tertiary text-black hover:bg-tertiary/80 shadow-md`}
            >
              <LogOut className={`${isCollapsed ? "size-7" : "size-5"}`} />
              {!isCollapsed && (
                <span className="font-semibold text-lg">Cerrar Sesión</span>
              )}
            </button>
          </TooltipTrigger>

          {isCollapsed && (
            <TooltipContent side="right" sideOffset={12}>
              Cerrar sesión
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
