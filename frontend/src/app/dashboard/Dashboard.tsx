import {
  Calendar,
  Ticket,
  Users,
  FileText,
  Globe,
  Home,
  User,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import {
  getAllEvents,
  getMyEvents,
} from "@/redux/features/events/events.thunks";
import { Separator } from "@/components/ui/separator";
import EventsService from "@/services/app/events/events.service";
import type { IEvents } from "@/models/app/events/events.model";
import { SidebarTrigger } from "@/components/ui/sidebar";

const QUICK_ACTIONS = [
  {
    href: "/events",
    icon: FileText,
    label: "Mis eventos",
    bg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-primary/20",
  },
  {
    href: "/all-events",
    icon: Globe,
    label: "Explorar",
    bg: "bg-secondary/20",
    iconColor: "text-secondary-foreground",
    border: "border-secondary/20",
  },
  {
    href: "/my-registrations",
    icon: Ticket,
    label: "Inscripciones",
    bg: "bg-tertiary/40",
    iconColor: "text-black",
    border: "border-tertiary/50",
  },
  {
    href: "/assistant-events",
    icon: UserCheck,
    label: "Asistente",
    bg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-primary/20",
  },
  {
    href: "/profile",
    icon: User,
    label: "Perfil",
    bg: "bg-black/5",
    iconColor: "text-black/60",
    border: "border-black/10",
  },
  {
    href: "/",
    icon: Home,
    label: "Inicio público",
    bg: "bg-black/5",
    iconColor: "text-black/60",
    border: "border-black/10",
  },
];

function getRoleBadge(role?: string) {
  if (!role) return null;
  const map: Record<string, string> = {
    asistente: "Asistente",
    organizador: "Organizador",
    participante: "Participante",
    admin: "Admin",
  };
  return map[role] ?? role;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { listEvents, listMyEvents, totalListEvents, totalMyEvents } =
    useAppSelector((s) => s.events);
  const [regPreview, setRegPreview] = useState<IEvents[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  useEffect(() => {
    void dispatch(getAllEvents({ filters: { skip: "0", limit: "6" } }));
    void dispatch(getMyEvents({ filters: { skip: "0", limit: "6" } }));
  }, [dispatch]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await EventsService.getMyRegistrations({
          skip: "0",
          limit: "6",
        });
        setRegPreview(r.items);
        setTotalRegistrations(r.total);
      } catch {
        setRegPreview([]);
        setTotalRegistrations(0);
      }
    })();
  }, []);

  return (
    <>
      {/* ── Header (untouched) ── */}
      <div className="max-w-3xl space-y-2">
        <div className="flex items-center gap-5">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="h-8 text-center mx-2 bg-black/50 hidden"
          />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
            Panel
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Hola{user?.sub ? `, ${user.sub}` : ""}. Aquí tienes accesos rápidos,
          novedades del catálogo y tus eventos.
        </p>
      </div>

      {/* ── Quick actions ── */}
      <div className="w-full space-y-3">
        <h2 className="text-base md:text-lg font-semibold  text-black">
          Acciones rápidas
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-5 -mx-1 px-1 scrollbar-none no-scrollbar">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              to={href}
              className={`group flex flex-col items-center gap-3 shrink-0 rounded-4xl border-2 border-black/2 bg-black/5 p-4 py-7 md:py-9 w-[140px] transition-all duration-200 hover:bg-primary hover:shadow-lg`}
            >
              <div className="size-11 md:size-14 lg:size-15 rounded-full bg-white/60 hover:bg-secondary flex items-center justify-center shadow-sm">
                <Icon
                  className={`size-5 md:size-7 text-primary group-hover:text-white transition-colors`}
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm: md:text-base font-semibold text-center leading-tight text-black group-hover:text-white transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Event lists ── */}
      <div className="w-full grid gap-6 lg:grid-cols-2">
        {/* Últimos en el catálogo */}
        <section className="rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="size-9 md:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="size-4 md:size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold leading-none">
                  Últimos en el catálogo
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {totalListEvents} en total
                </p>
              </div>
            </div>
            <Link
              to="/all-events"
              className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-primary hover:underline"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {listEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-4">
                Aún no hay eventos publicados.
              </p>
            ) : (
              listEvents.slice(0, 6).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-black truncate">
                    {ev.title}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                    {ev.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mis eventos recientes */}
        <section className="rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="size-9 md:size-10 rounded-lg bg-tertiary/50 flex items-center justify-center">
                <Users className="size-4 md:size-5 text-black" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold leading-none">
                  Mis eventos recientes
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {totalMyEvents} en total
                </p>
              </div>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-primary hover:underline"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {listMyEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-4">
                No tienes eventos como organizador o asistente todavía.
              </p>
            ) : (
              listMyEvents.slice(0, 6).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-tertiary/10 transition-colors"
                >
                  <span className="text-sm font-semibold text-black truncate">
                    {ev.title}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                    {ev.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Mis inscripciones ── */}
      <section className="w-full rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="size-9 md:size-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Ticket className="size-4 md:size-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold leading-none">
                Mis inscripciones
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalRegistrations} en total
              </p>
            </div>
          </div>
          <Link
            to="/my-registrations"
            className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-primary hover:underline"
          >
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border/30">
          {regPreview.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-4">
              Aún no estás inscrito en ningún evento como participante o
              asistente.
            </p>
          ) : (
            regPreview.map((ev) => {
              const roleBadge = getRoleBadge(ev.role ?? undefined);
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-secondary/10 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-black block truncate">
                      {ev.title}
                    </span>
                    {roleBadge && (
                      <span className="text-[11px] text-muted-foreground">
                        {roleBadge}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                    {ev.date}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};
