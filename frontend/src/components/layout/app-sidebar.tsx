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

export function AppSidebar() {
  const { setOpen } = useSidebar();

  const { user } = useContext(AuthContext)!;

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
    <Sidebar>
      <SidebarHeader className="p-4 font-extrabold md:pt-12 pb-4 md:pb-6 text-primary text-center bg-background text-3xl">
        <Link to="/" onClick={handleCloseSidebar}>
          TUSDATOS.CO
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 bg-background">
        <NavMain
          items={menuItems}
          user={user}
          onNavigate={handleCloseSidebar}
        />
      </SidebarContent>

      <SidebarFooter className="p-2 md:pb-6 bg-background">
        <button
          onClick={handleCloseSidebar}
          className="flex items-center cursor-pointer mx-2 text-lg font-semibold gap-2 p-2 pl-4 rounded-xl h-12 hover:bg-black/10"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
