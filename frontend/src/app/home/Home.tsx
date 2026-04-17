import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";
import { PinContainer } from "@/components/ui/3d-pin";
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

function isUserEnrolledInEvent(role: string | null | undefined) {
  return role === "usuario" || role === "asistente";
}

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

      <div className="container xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full bg-background flex flex-col mt-20 gap-10">
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
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
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
              variant="outline"
              size="sm"
              disabled={(page + 1) * PAGE_SIZE >= totalListEvents}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
        <Separator />

        {isLoadingGetEvents ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full col-span-full">
              <h2 className="text-2xl font-bold text-slate-100/50">
                No hay eventos disponibles
              </h2>
            </div>
          ) : (
            listEvents.map((event) => {
              const lleno = event.registered_count >= event.capacity;
              const expirado = isEventDatePast(event.date);
              const bloqueado = lleno || expirado;
              return (
                <div
                  className={cn(
                    "my-4 rounded-xl transition-opacity",
                    bloqueado
                      ? "cursor-not-allowed opacity-80"
                      : "cursor-pointer",
                  )}
                  key={event.id}
                  onClick={() => {
                    if (bloqueado) return;
                    setOpenModal({ open: true, event });
                  }}
                  onKeyDown={(e) => {
                    if (bloqueado) return;
                    if (e.key === "Enter") setOpenModal({ open: true, event });
                  }}
                  role="button"
                  tabIndex={bloqueado ? -1 : 0}
                  aria-disabled={bloqueado}
                >
                  <PinContainer
                    title={`${event.registered_count}/${event.capacity}`}
                    interactive={!bloqueado}
                  >
                    <div className="flex basis-full flex-col p-4 tracking-tight sm:basis-1/2 w-[20rem] h-[20rem] ">
                      <div className="flex flex-wrap items-center gap-2 max-w-xs !pb-2">
                        <h3 className="!m-0 font-bold text-base">
                          {event.title}
                        </h3>
                        {expirado ? (
                          <span className="shrink-0 rounded-md border border-amber-600/50 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                            Evento expirado
                          </span>
                        ) : null}
                        {lleno ? (
                          <span className="shrink-0 rounded-md border border-destructive/60 bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                            Evento lleno
                          </span>
                        ) : null}
                        {isUserEnrolledInEvent(event.role) ? (
                          <span className="shrink-0 rounded-md border border-emerald-600/50 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                            Ya inscrito
                          </span>
                        ) : null}
                      </div>
                      <div className="text-base !m-0 !p-0 font-normal">
                        <span className="text-slate-500 ">
                          {event.description}
                        </span>
                      </div>
                      <div className="text-base !m-0 !p-0 font-normal">
                        <span className="text-slate-500 ">{event.date}</span>
                      </div>
                      <div className="pt-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver detalle y sesiones
                        </Link>
                      </div>
                      <div
                        className={cn(
                          "flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500",
                          expirado
                            ? "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900"
                            : lleno
                              ? "bg-gradient-to-br from-violet-500 via-red-500 to-red-900"
                              : "bg-gradient-to-br from-blue-500 via-green-600 to-green-900",
                        )}
                      />
                    </div>
                  </PinContainer>
                </div>
              );
            })
          )}
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
