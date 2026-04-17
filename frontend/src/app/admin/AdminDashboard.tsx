import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Shield } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminDashboard() {
  return (
    <div className=" flex flex-col gap-8">
      <div className="max-w-3xl space-y-2 mb-6">
        <div className="flex items-center gap-5">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="h-8 text-center mx-2 bg-black/50 hidden"
          />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
            Administración
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Como administrador tienes los mismos permisos prácticos que un
          organizador en cada evento
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card/30 p-5 flex flex-col gap-3">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Todos los eventos</h2>
          <p className="text-sm text-muted-foreground flex-1">
            Listado global con búsqueda, edición, borrado, asignación de
            usuarios y panel de inscripciones por evento.
          </p>
          <Button asChild variant="default" className="w-fit">
            <Link to="/admin/events">Ir a eventos</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/80 bg-card/30 p-5 flex flex-col gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Usuarios del sistema</h2>
          <p className="text-sm text-muted-foreground flex-1">
            Buscar por nombre o correo, cambiar rol global (admin / usuario) o
            eliminar cuentas.
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/admin/users">Ir a usuarios</Link>
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <Shield className="h-4 w-4 shrink-0 mt-0.5" />
        La titularidad de un evento (organizador) se gestiona en inscripciones:
        puedes trasladarla a otro usuario; el organizador anterior pasa a
        participante si no tenía ya una inscripción.
      </p>
    </div>
  );
}
