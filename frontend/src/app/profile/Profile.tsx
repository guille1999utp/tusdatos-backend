import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import EventsService from "@/services/app/events/events.service";
import type { IEvents } from "@/models/app/events/events.model";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Mail, Ticket, CalendarDays, ArrowUpRight } from "lucide-react";

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function getRoleLabel(role?: string | null) {
  const map: Record<string, string> = {
    admin: "Admin",
    organizador: "Organizador",
    asistente: "Asistente",
    participante: "Participante",
    usuario: "Usuario",
  };
  return role ? (map[role] ?? role) : "Sin rol";
}

function getRoleColors(role?: string | null) {
  if (role === "admin") return "bg-primary text-white";
  if (role === "organizador") return "bg-secondary text-white";
  if (role === "asistente") return "bg-tertiary text-black";
  return "bg-black/10 text-black/70";
}

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

  const email = user?.sub ?? "";
  const role = user?.role;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header (untouched) ── */}
      <div className="max-w-3xl space-y-2">
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

      {/* ── Profile card ── */}
      <div className="relative rounded-3xl border border-border/50 bg-card/70 overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-start justify-between w-full gap-3 md:gap-5">
            <div className="flex items-start flex-col md:flex-row gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white text-xl font-black shadow-lg bg-primary">
                {email ? getInitials(email) : "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2 md:block hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs md:text-sm xl:text-base font-bold px-3 py-1 rounded-full ${getRoleColors(role)}`}
                  >
                    {getRoleLabel(role)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base xl:text-lg text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium text-black/80">
                    {email || "No disponible"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2 md:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${getRoleColors(role)}`}
                >
                  {getRoleLabel(role)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate font-medium text-black/80">
                  {email || "No disponible"}
                </span>
              </div>
            </div>
            {/* Stat */}
            <div className="hidden md:flex flex-col items-center justify-center bg-primary/8 border border-primary/15 rounded-2xl p-4 py-4 shrink-0 min-w-[100px]">
              <span className="text-3xl font-black text-primary leading-none">
                {events.length}
              </span>
              <span className="text-sm font-semibold text-black mt-1 text-center leading-tight">
                Inscripciones
              </span>
            </div>
          </div>

          {/* Stat */}
          <div className="flex md:hidden flex-col items-center justify-center bg-primary/8 border border-primary/15 rounded-2xl px-6 py-4 shrink-0 min-w-[100px]">
            <span className="text-3xl font-black text-primary leading-none">
              {events.length}
            </span>
            <span className="text-sm font-semibold text-black mt-1 text-center leading-tight">
              Inscripciones
            </span>
          </div>
        </div>
      </div>

      {/* ── Registered events ── */}
      <section className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="size-9 md:size-11 rounded-lg bg-tertiary/50 flex items-center justify-center">
              <Ticket className="size-5 md:size-6 text-black" />
            </div>
            <h2 className="text-sm md:text-base font-bold">
              Eventos inscritos
            </h2>
          </div>
          <Link
            to="/my-registrations"
            className="flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
          >
            Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading && (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-center gap-3 animate-pulse"
              >
                <div className="w-8 h-8 rounded-lg bg-black/8 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-black/8 rounded w-2/3" />
                  <div className="h-2.5 bg-black/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-5 text-center">
            <div className="size-12 md:size-14 rounded-2xl bg-black/5 flex items-center justify-center">
              <CalendarDays className="size-6 md:size-7 text-black/30" />
            </div>
            <p className="text-sm text-muted-foreground">
              No tienes registros todavía.
            </p>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div className="divide-y divide-border/30">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors"
              >
                <div className="size-9 md:size-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="size-5 md:size-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {event.description}
                    </p>
                  )}
                </div>
                {event.date && (
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                    {event.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
