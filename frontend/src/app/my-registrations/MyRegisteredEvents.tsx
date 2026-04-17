import type { IEvents } from "@/models/app/events/events.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import EventsService from "@/services/app/events/events.service";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import SimpleEventCard from "@/app/home/_components/SimpleEventCard";
import toast from "react-hot-toast";

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

export const MyRegisteredEvents = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [leavingId, setLeavingId] = useState<number | null>(null);
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
    [page, debouncedSearch],
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

  const handleLeave = async (event: IEvents) => {
    setLeavingId(event.id);
    try {
      await EventsService.leaveEventSelf(event.id);
      toast.success("Has abandonado el evento");
      await onMounted();
    } catch {
      toast.error("No se pudo abandonar el evento");
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="max-w-full flex flex-col gap-8 pb-10">
      {/* ── Page header ── */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
            Mis inscripciones
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Eventos en los que figuras como participante, asistente u
            organizador.
          </p>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="rounded-4xl backdrop-blur-xl flex flex-col gap-4">
        <div className="relative flex items-center max-w-md">
          <Search
            className="absolute left-3 text-muted-foreground pointer-events-none"
            size={16}
          />
          <Input
            placeholder="Buscar por título…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-9 shadow-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(0);
              }}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {isLoadingGetEvents
            ? "Cargando…"
            : `${totalListEvents} eventos como asistente`}
        </span>
      </div>

      {/* ── Events grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
        {isLoadingGetEvents ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3rem] md:rounded-[4rem] bg-black/5 animate-pulse flex flex-col justify-between p-8"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-44 rounded-full bg-black/10" />
                <Skeleton className="h-6 w-24 rounded-md bg-black/10" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-32 rounded-md bg-black/10" />
                <Skeleton className="h-16 w-full rounded-xl bg-black/10" />
                <Skeleton className="h-12 w-full rounded-[2rem] bg-black/10" />
              </div>
            </div>
          ))
        ) : listEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full col-span-full py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary/50">
              No tienes inscripciones
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
              Explora el catálogo e inscríbete en un evento para verlo aquí.
            </p>
          </div>
        ) : (
          listEvents.map((event, index) => {
            const expirado = isEventDatePast(event.date);
            const lleno = (event.registered_count ?? 0) >= event.capacity;
            const canLeave = event.role !== "organizador";

            return (
              <SimpleEventCard
                key={event.id}
                event={event}
                index={index}
                isExpired={expirado}
                isFull={lleno}
                canLeave={canLeave}
                onLeave={() => void handleLeave(event)}
                isLeaving={leavingId === event.id}
              />
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoadingGetEvents && totalListEvents > 0 && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-xl gap-1"
          >
            <ChevronLeft size={15} /> Anterior
          </Button>
          <span className="text-sm font-medium text-foreground tabular-nums whitespace-nowrap">
            {page + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= totalListEvents}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl gap-1"
          >
            Siguiente <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
};
