import { useTableAllListEvents } from "@/hooks/app/all-events/useTableAllEvents";
import type { IEvents } from "@/models/app/events/events.model";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import EventCard from "@/app/home/_components/EventCard";
import { suscribeEvents } from "@/redux/features/events/events.thunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EventsService from "@/services/app/events/events.service";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function isEnrolled(role: string | null | undefined) {
  return role === "usuario" || role === "asistente";
}

function isOrganizer(role: string | null | undefined) {
  return role === "organizador";
}

const STATE_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "scheduled", label: "Programado" },
  { value: "ongoing", label: "En curso" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

export const AllEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      skip: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
      ...(stateFilter ? { state: stateFilter } : {}),
      ...(minCapacity ? { min_capacity: minCapacity } : {}),
      ...(maxCapacity ? { max_capacity: maxCapacity } : {}),
    }),
    [page, debouncedSearch, stateFilter, minCapacity, maxCapacity],
  );

  const { listEvents, onMounted, totalListEvents, isLoadingGetEvents } =
    useTableAllListEvents(filters);

  const totalPages = Math.max(1, Math.ceil(totalListEvents / PAGE_SIZE));

  const handleSubscribe = async (event: IEvents) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/all-events`)}`);
      return;
    }
    const result = await dispatch(
      suscribeEvents({
        params: { id: event.id },
        errorCallback: (msg) => {
          toast.error(msg);
        },
      }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Te has registrado en el evento");
      await onMounted();
    }
  };

  const handleLeave = async (event: IEvents) => {
    try {
      await EventsService.leaveEventSelf(event.id);
      toast.success("Has abandonado el evento");
      await onMounted();
    } catch {
      toast.error("No se pudo abandonar el evento");
    }
  };

  const hasActiveFilters = search || stateFilter || minCapacity || maxCapacity;

  const clearFilters = () => {
    setSearch("");
    setStateFilter("");
    setMinCapacity("");
    setMaxCapacity("");
    setPage(0);
  };

  return (
    <div className="max-w-full flex flex-col gap-8 pb-10">
      {/* ── Page header ── */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
          Eventos
        </h1>
      </div>

      {/* ── Filters panel ── */}
      <div className="rounded-4xl border backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-4">
        <p className="text-sm md:text-base font-semibold text-blackd">
          Buscar y filtrar
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 text-muted-foreground pointer-events-none"
              size={16}
            />
            <Input
              placeholder="Título…"
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

          {/* State */}
          <Select
            value={stateFilter || "all"}
            onValueChange={(val) => {
              setStateFilter(val === "all" ? "" : val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-black">Estado</SelectLabel>
                {STATE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value || "all"}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Min capacity */}
          <Input
            type="number"
            min={1}
            placeholder="Capacidad mín."
            value={minCapacity}
            onChange={(e) => {
              setMinCapacity(e.target.value);
              setPage(0);
            }}
            className=" shadow-none"
          />

          {/* Max capacity */}
          <Input
            type="number"
            min={1}
            placeholder="Capacidad máx."
            value={maxCapacity}
            onChange={(e) => {
              setMaxCapacity(e.target.value);
              setPage(0);
            }}
            className="shadow-none"
          />
        </div>

        {/* Filter actions + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
              >
                <X size={13} /> Limpiar filtros
              </button>
            )}
            <span className="text-xs text-black">
              {isLoadingGetEvents
                ? "Cargando…"
                : `${totalListEvents} eventos encontrados`}
            </span>
          </div>
        </div>
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
                <Skeleton className="h-20 w-full rounded-xl bg-black/10" />
                <div className="h-10 w-3/4 rounded-xl bg-black/10" />
              </div>
            </div>
          ))
        ) : listEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full col-span-full py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-primary/50">
              No hay eventos disponibles
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm text-primary hover:underline font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          listEvents.map((event, index) => {
            const lleno = event.registered_count >= event.capacity;
            const expirado = isEventDatePast(event.date);
            const enrolled = isEnrolled(event.role);
            const organizer = isOrganizer(event.role);

            return (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                isFull={lleno}
                isExpired={expirado}
                isEnrolled={enrolled}
                isOrganizer={organizer}
                onClick={() => {
                  if (enrolled) {
                    void handleLeave(event);
                  } else {
                    void handleSubscribe(event);
                  }
                }}
              />
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-end justify-end gap-2">
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
    </div>
  );
};
