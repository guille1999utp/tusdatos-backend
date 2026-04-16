"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCog,
  CalendarSearch,
  UserCheck,
  Ticket,
  UserCircle,
  LogOut,
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const { setOpen } = useSidebar();

  const handleCloseSidebar = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const menuItems = [
    { label: "Panel", to: "/dashboard", icon: LayoutDashboard },
    { label: "Eventos", to: "/events", icon: CalendarCog },
    { label: "Explorar", to: "/all-events", icon: CalendarSearch },
    { label: "Inscripciones", to: "/my-registrations", icon: Ticket },
    { label: "Asistente", to: "/assistant-events", icon: UserCheck },
    { label: "Perfil", to: "/profile", icon: UserCircle },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 font-extrabold md:pt-12 pb-4 md:pb-6 text-primary text-center bg-background text-3xl">
        <Link to="/" onClick={handleCloseSidebar}>
          TUSDATOS.CO
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 space-y-0 bg-background">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleCloseSidebar}
              className={`flex items-center ml-2 text-lg font-semibold gap-2 p-2 pl-4 rounded-xl h-13 transition-all
                ${
                  isActive
                    ? "bg-primary text-white border-2 shadow-lg"
                    : "hover:bg-black/10"
                }
              `}
            >
              <item.icon className="size-6 mr-1" />
              {item.label}
            </Link>
          );
        })}
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
