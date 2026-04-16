import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";
import { AuroraText } from "@/components/magicui/aurora-text";
import { PinContainer } from "@/components/ui/3d-pin";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FormEventsSuscribe } from "@/modules/app/all-events/components/FormEventsSuscribe";
import type { IEvents } from "@/models/app/events/events.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import EventsService from "@/services/app/events/events.service";
import { Link } from "react-router-dom";

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

function roleBadge(role: string | null | undefined) {
  if (role === "organizador") return { label: "Organizador", className: "border-violet-600/50 bg-violet-500/15 text-violet-900 dark:text-violet-100" };
  if (role === "asistente") return { label: "Asistente", className: "border-sky-600/50 bg-sky-500/15 text-sky-900 dark:text-sky-100" };
  return { label: "Participante", className: "border-emerald-600/50 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100" };
}

export const MyRegisteredEvents = () => {
  const [openModal, setOpenModal] = useState<{ open: boolean; event: IEvents | null }>({
    open: false,
    event: null,
  });
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [listEvents, setListEvents] = useState<IEvents[]>([]);
  const [totalListEvents, setTotalListEvents] = useState(0);
  const [isLoadingGetEvents, setIsLoadingGetEvents] = useState(false);

  const filters = useMemo(
    () => ({
      skip: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    }),
    [page, debouncedSearch]
  );

  const onMounted = useCallback(async () => {
    setIsLoadingGetEvents(true);
    try {
      const resp = await EventsService.getMyRegistrations(filters);
      setListEvents(resp.items);
      setTotalListEvents(resp.total);
    } catch {
      setListEvents([]);
      setTotalListEvents(0);
    } finally {
      setIsLoadingGetEvents(false);
    }
  }, [filters]);

  useEffect(() => {
    void onMounted();
  }, [onMounted]);

  const totalPages = Math.max(1, Math.ceil(totalListEvents / PAGE_SIZE));

  return (
    <>
      <div className="container xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full bg-background flex flex-col mt-20 gap-10">
        <div className="flex w-full flex-col gap-2">
          <h1 className="flex text-4xl font-bold md:text-5xl lg:text-7xl w-full text-slate-100/50">
            <AuroraText>Mis inscripciones</AuroraText>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Eventos en los que figuras con inscripción (como participante o asistente). Si además eres el organizador del
            evento, también aparece aquí con ese rol.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-md space-y-1">
            <label className="text-sm text-muted-foreground">Buscar por título</label>
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

        {isLoadingGetEvents ? <p className="text-muted-foreground">Cargando…</p> : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full col-span-full py-12">
              <h2 className="text-2xl font-bold text-slate-100/50">No tienes inscripciones</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                Explora el catálogo e inscríbete en un evento para verlo aquí.
              </p>
            </div>
          ) : (
            listEvents.map((event) => {
              const badge = roleBadge(event.role);
              const expirado = isEventDatePast(event.date);
              return (
                <div
                  className="my-4 rounded-xl cursor-pointer transition-opacity"
                  key={event.id}
                  onClick={() => setOpenModal({ open: true, event })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setOpenModal({ open: true, event });
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <PinContainer
                    title={`${event.registered_count ?? 0}/${event.capacity}`}
                    interactive
                  >
                    <div className="flex basis-full flex-col p-4 tracking-tight sm:basis-1/2 w-[20rem] h-[20rem] ">
                      <div className="flex flex-wrap items-center gap-2 max-w-xs !pb-2">
                        <h3 className="!m-0 font-bold text-base">{event.title}</h3>
                        <span
                          className={cn(
                            "shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold",
                            badge.className
                          )}
                        >
                          {badge.label}
                        </span>
                        {expirado ? (
                          <span className="shrink-0 rounded-md border border-amber-600/50 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                            Fecha pasada
                          </span>
                        ) : null}
                      </div>
                      <div className="text-base !m-0 !p-0 font-normal">
                        <span className="text-slate-500 ">{event.description}</span>
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
                          "flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br",
                          expirado
                            ? "from-zinc-600 via-zinc-700 to-zinc-900"
                            : "from-violet-500 via-purple-500 to-blue-500"
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
        title="Mi inscripción"
        open={openModal.open}
        setOpenModal={(o) => {
          if (!o) setOpenModal({ open: false, event: null });
        }}
      >
        <FormEventsSuscribe event={openModal.event} setOpenModal={setOpenModal} onMounted={onMounted} />
      </MainDialog>
    </>
  );
};
