import { useEffect, useState } from "react";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Separator } from "@/components/ui/separator";
import EventsService from "@/services/app/events/events.service";
import type { IEvents } from "@/models/app/events/events.model";
import { useAuth } from "@/hooks/useAuth";

export const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<IEvents[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const response = await EventsService.getMyRegistrations();
        setEvents(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="container xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full bg-background flex flex-col mt-20 gap-6">
      <h1 className="flex text-4xl font-bold md:text-5xl lg:text-7xl w-full text-slate-100/50">
        <AuroraText>Perfil</AuroraText>
      </h1>
      <Separator />

      <div className="rounded-lg border p-4 space-y-2">
        <p><strong>Email:</strong> {user?.sub ?? "No disponible"}</p>
        <p><strong>Rol:</strong> {user?.role ?? "No disponible"}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Eventos a los que estoy registrado</h2>
        {isLoading && <p>Cargando eventos...</p>}
        {!isLoading && events.length === 0 && <p>No tienes registros todavía.</p>}
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
