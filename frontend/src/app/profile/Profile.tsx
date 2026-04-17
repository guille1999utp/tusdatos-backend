import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import EventsService from "@/services/app/events/events.service";
import type { IEvents } from "@/models/app/events/events.model";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<IEvents[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const response = await EventsService.getMyRegistrations({
          skip: "0",
          limit: "50",
        });
        setEvents(response.items);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-3xl space-y-2 mb-6">
        <div className="flex items-center gap-5">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="h-8 text-center mx-2 bg-black/50 hidden"
          />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
            Perfil
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Información de tu perfil y eventos a los que estás registrado.
        </p>
      </div>
      <Separator />

      <div className="rounded-lg border p-4 space-y-2">
        <p>
          <strong>Email:</strong> {user?.sub ?? "No disponible"}
        </p>
        <p>
          <strong>Rol:</strong> {user?.role ?? "No disponible"}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            Eventos a los que estoy registrado
          </h2>
          <Link
            to="/my-registrations"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver página con búsqueda y paginación →
          </Link>
        </div>
        {isLoading && <p>Cargando eventos...</p>}
        {!isLoading && events.length === 0 && (
          <p>No tienes registros todavía.</p>
        )}
        {!isLoading && events.length > 0 && (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="rounded-md border p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm opacity-80">{event.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
