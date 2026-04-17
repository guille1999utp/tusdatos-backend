import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";

import { Separator } from "@/components/ui/separator";
import { useTableAllListEvents } from "@/hooks/app/all-events/useTableAllEvents";
import { cn } from "@/lib/utils";
import { FormEventsSuscribe } from "@/modules/app/all-events/components/FormEventsSuscribe";
import type { IEvents } from "@/models/app/events/events.model";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import EventsService from "@/services/app/events/events.service";
import TransitionLink from "@/providers/TransitionLink";
import EventCard from "./_components/EventCard";

const PAGE_SIZE = 9;

function isEventDatePast(dateStr: string): boolean {
  const raw = String(dateStr).trim();
  const ymd = raw.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const eventDay = new Date(y, mo, d);
    eventDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDay < today;
  }
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return false;
  const eventDay = new Date(t);
  eventDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDay < today;
}

// function isUserEnrolledInEvent(role: string | null | undefined) {
//   return role === "usuario" || role === "asistente";
// }

export default function Home() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState<{
    open: boolean;
    event: IEvents | null;
  }>({
    open: false,
    event: null,
  });
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      skip: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    }),
    [page, debouncedSearch],
  );

  const { listEvents, onMounted, totalListEvents, isLoadingGetEvents } =
    useTableAllListEvents(filters);

  const totalPages = Math.max(1, Math.ceil(totalListEvents / PAGE_SIZE));

  const eventIdParam = searchParams.get("eventId");

  useEffect(() => {
    if (!eventIdParam) return;
    const id = Number(eventIdParam);
    if (Number.isNaN(id)) return;

    const fromList = listEvents.find((e) => e.id === id);
    if (fromList) {
      setOpenModal({ open: true, event: fromList });
      return;
    }

    if (isLoadingGetEvents) return;

    let cancelled = false;
    void EventsService.getById(id)
      .then((ev) => {
        if (!cancelled) setOpenModal({ open: true, event: ev });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [eventIdParam, listEvents, isLoadingGetEvents]);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-60 w-full max-md:px-2">
        <div className="mx-auto flex h-16 max-w-xl rounded-full mt-3 bg-secondary/80 backdrop-blur-md shadow-xl items-center justify-between gap-4 px-4">
          <Link
            to="/"
            className="text-base md:text-xl xl:text-3xl font-extrabold uppercase tracking-tight text-tertiary"
          >
            Tusdatos
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md px-1.5 py-1.5 text-white text-lg font-semibold"
                >
                  Panel
                </Link>
                <Link
                  to="/all-events"
                  className="rounded-md px-1.5 py-1.5 text-white text-lg font-semibold"
                >
                  Explorar
                </Link>
                <Button
                  type="button"
                  variant={"main"}
                  className="shadow-xl border border-white hover:shadow-none"
                  onClick={() => logout()}
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <TransitionLink to="/login">
                  <Button
                    variant={"default"}
                    className={cn(
                      "w-full py-5 md:py-6 font-bold text-white bg-transparent text-base md:text-lg ",
                    )}
                  >
                    Iniciar sesión
                  </Button>
                </TransitionLink>
                <TransitionLink to="/register">
                  <Button
                    variant={"main"}
                    className={cn(
                      "w-full py-5 md:py-6 font-bold border border-white ",
                    )}
                  >
                    Registrarse
                  </Button>
                </TransitionLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* <SvgFollowScroll /> */}

      <div className="container relative xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full flex flex-col mt-20 gap-10">
        <div className="flex w-full flex-col gap-2">
          <h1 className="flex text-4xl font-bold md:text-5xl lg:text-7xl w-full text-primary">
            Eventos disponibles
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Explora los eventos abiertos a inscripción. Si inicias sesión,
            podrás confirmar tu participación desde el mismo panel.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-md space-y-1">
            <label className="text-sm text-muted-foreground">
              Buscar eventos
            </label>
            <Input
              placeholder="Título…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>
        <Separator />

        {isLoadingGetEvents ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {listEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full col-span-full py-20">
              <h2 className="text-2xl font-bold text-black">
                No hay eventos disponibles
              </h2>
            </div>
          ) : (
            listEvents.map((event, index) => {
              const pieno = event.registered_count >= event.capacity;
              const scaduto = isEventDatePast(event.date);

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isFull={pieno}
                  isExpired={scaduto}
                  onClick={() => setOpenModal({ open: true, event })}
                />
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end mt-3">
          <Button
            type="button"
            variant="main"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Página {page + 1} / {totalPages} · {totalListEvents} eventos
          </span>
          <Button
            type="button"
            variant="main"
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= totalListEvents}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
      <MainDialog
        title="Eventos"
        open={openModal.open}
        setOpenModal={(o) => {
          if (!o) {
            setOpenModal({ open: false, event: null });
            if (searchParams.get("eventId"))
              setSearchParams({}, { replace: true });
          }
        }}
      >
        <FormEventsSuscribe
          event={openModal.event}
          setOpenModal={setOpenModal}
          onMounted={onMounted}
        />
      </MainDialog>
    </div>
  );
}
