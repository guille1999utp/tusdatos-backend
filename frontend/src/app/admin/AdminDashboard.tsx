import { AuroraText } from "@/components/magicui/aurora-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Shield } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full bg-background flex flex-col mt-20 gap-8">
      <div>
        <h1 className="text-4xl font-bold md:text-5xl">
          <AuroraText>Administración</AuroraText>
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl mt-3">
          Como administrador tienes los mismos permisos prácticos que un organizador en cada evento: ver inscripciones,
          asignar o quitar personas, cambiar roles (participante, asistente o titular del evento) y editar o eliminar
          cualquier evento.
        </p>
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <div className="rounded-xl border border-border/80 bg-card/30 p-5 flex flex-col gap-3">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Todos los eventos</h2>
          <p className="text-sm text-muted-foreground flex-1">
            Listado global con búsqueda, edición, borrado, asignación de usuarios y panel de inscripciones por evento.
          </p>
          <Button asChild variant="default" className="w-fit">
            <Link to="/admin/events">Ir a eventos</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/80 bg-card/30 p-5 flex flex-col gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Usuarios del sistema</h2>
          <p className="text-sm text-muted-foreground flex-1">
            Buscar por nombre o correo, cambiar rol global (admin / usuario) o eliminar cuentas.
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/admin/users">Ir a usuarios</Link>
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl flex items-start gap-2">
        <Shield className="h-4 w-4 shrink-0 mt-0.5" />
        La titularidad de un evento (organizador) se gestiona en inscripciones: puedes trasladarla a otro usuario; el
        organizador anterior pasa a participante si no tenía ya una inscripción.
      </p>
    </div>
  );
}
