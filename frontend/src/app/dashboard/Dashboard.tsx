import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import {
  BellIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { Calendar, CalendarDays, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardStack } from "@/components/ui/card-stack";
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

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 px-1 py-0.5",
        className,
      )}
    >
      {children}
    </span>
  );
};

const PREVIEW_CARDS = [
  {
    id: 0,
    name: "Explorar",
    designation: "Catálogo",
    content: (
      <p>
        <Highlight>Todos</Highlight> los eventos abiertos a inscripción.
      </p>
    ),
  },
  {
    id: 1,
    name: "Mis eventos",
    designation: "Organizo / staff",
    content: (
      <p>
        <Highlight>Creados</Highlight> por ti o donde eres asistente.
      </p>
    ),
  },
  {
    id: 2,
    name: "Asistente",
    designation: "Solo staff",
    content: (
      <p>
        <Highlight>Colaboras</Highlight> como miembro del equipo del evento.
      </p>
    ),
  },
];

const features = [
  {
    Icon: GlobeIcon,
    name: "Explorar eventos",
    description: "Listado completo para inscribirte o ver detalles.",
    href: "/all-events",
    cta: "Abrir",
    background: <CardStack items={PREVIEW_CARDS} />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3 ",
  },
  {
    Icon: FileTextIcon,
    name: "Mis eventos",
    description: "Organizas o apoyas como asistente.",
    href: "/events",
    cta: "Ver",
    background: (
      <img className="absolute -right-20 -top-20 opacity-60" alt="" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3 ",
  },
  {
    Icon: CalendarDays,
    name: "Como asistente",
    description: "Solo eventos donde eres del staff.",
    href: "/assistant-events",
    cta: "Ver",
    background: (
      <img className="absolute -right-20 -top-20 opacity-60" alt="" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: InputIcon,
    name: "Inicio público",
    description: "Vista de bienvenida con el catálogo (también sin sesión).",
    href: "/",
    cta: "Ir",
    background: (
      <img className="absolute -right-20 -top-20 opacity-60" alt="" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: BellIcon,
    name: "Perfil",
    description: "Tus datos y preferencias de cuenta.",
    href: "/profile",
    cta: "Abrir",
    background: (
      <img className="absolute -right-20 -top-20 opacity-60" alt="" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

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
      <div className="max-w-3xl space-y-2">
        <div className="flex items-center  gap-5">
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

      <BentoGrid className="lg:grid-rows-3 mx-auto w-full ">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>

      <div className="mx-auto w-full  grid gap-10 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Últimos en el catálogo</h2>
            <span className="text-xs text-muted-foreground">
              ({totalListEvents} en total)
            </span>
          </div>
          <Separator />
          {listEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay eventos publicados.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {listEvents.slice(0, 6).map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2"
                >
                  <span className="font-medium">{ev.title}</span>
                  <span className="text-muted-foreground">{ev.date}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/all-events"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos los eventos →
          </Link>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Mis eventos recientes</h2>
            <span className="text-xs text-muted-foreground">
              ({totalMyEvents} en total)
            </span>
          </div>
          <Separator />
          {listMyEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes eventos como organizador o asistente todavía.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {listMyEvents.slice(0, 6).map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2"
                >
                  <span className="font-medium">{ev.title}</span>
                  <span className="text-muted-foreground">{ev.date}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/events"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ir a mis eventos →
          </Link>
        </section>
      </div>

      <section className="mx-auto w-full space-y-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Mis inscripciones</h2>
          <span className="text-xs text-muted-foreground">
            ({totalRegistrations} en total)
          </span>
        </div>
        <Separator />
        {regPreview.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no estás inscrito en ningún evento como participante o
            asistente.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {regPreview.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2"
              >
                <span className="font-medium">{ev.title}</span>
                <span className="text-muted-foreground">
                  {ev.date}
                  {ev.role
                    ? ` · ${ev.role === "asistente" ? "Asistente" : ev.role === "organizador" ? "Organizador" : "Participante"}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/my-registrations"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver todos mis eventos inscritos →
        </Link>
      </section>
    </>
  );
};
