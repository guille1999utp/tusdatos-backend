import { useTableAllListEvents } from "@/hooks/app/all-events/useTableAllEvents";
import { cn } from "@/lib/utils";
import type { IEvents } from "@/models/app/events/events.model";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EventsService from "@/services/app/events/events.service";
import TransitionLink from "@/providers/TransitionLink";
import EventCard from "./_components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import Grainient from "@/components/ui/Grainient";
import { suscribeEvents } from "@/redux/features/events/events.thunks";
import { useAppDispatch } from "@/redux/hooks";
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

function isEnrolled(role: string | null | undefined) {
  return role === "usuario" || role === "asistente";
}

function isOrganizer(role: string | null | undefined) {
  return role === "organizador";
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  const handleSubscribe = async (event: IEvents) => {
    if (!user) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/?eventId=${event.id}`)}`,
      );
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

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* ── Header ── */}
        <header className="fixed top-0 z-60 w-full max-md:px-2">
          <div className="mx-auto flex h-16 max-w-xl rounded-full border-2 border-white mt-3 bg-tertiary backdrop-blur-md shadow-xl items-center justify-between gap-4 px-4">
            <Link
              to="/"
              className="text-base md:text-xl xl:text-3xl font-extrabold uppercase tracking-tight text-black"
            >
              Tusdatos
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="rounded-full px-1 hover:bg-black/5 md:px-3 py-1.5 text-black text-lg font-semibold"
                  >
                    Panel
                  </Link>
                  <Link
                    to="/all-events"
                    className="rounded-full px-1 hover:bg-black/5 md:px-3 py-1.5 text-black text-lg font-semibold"
                  >
                    Explorar
                  </Link>
                  <Button
                    type="button"
                    variant={"main"}
                    className="shadow-xl border border-white hover:shadow-none font-semibold"
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
                        "w-full py-5 max-md:px-1 md:py-6 font-bold text-black hover:bg-black/10 bg-transparent text-sm md:text-lg",
                      )}
                    >
                      Iniciar sesión
                    </Button>
                  </TransitionLink>
                  <TransitionLink to="/register">
                    <Button
                      variant={"main"}
                      className={cn(
                        "w-full py-5 md:py-6 font-bold border border-white text-sm md:text-base",
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

        {/* ── Hero ── */}
        <section className="relative min-h-[60dvh] md:min-h-[70dvh] flex flex-col items-center justify-center overflow-hidden">
          <div className="blob absolute top-[5%] left-[-8%] w-[560px] h-[560px] rounded-full bg-primary/20 blur-[130px] pointer-events-none" />
          <div className="blob-2 absolute top-[35%] right-[-6%] w-[460px] h-[460px] rounded-full bg-secondary/25 blur-[110px] pointer-events-none" />
          <div className="blob-3 absolute bottom-[5%] left-[25%] w-[680px] h-[400px] rounded-full bg-tertiary/20 blur-[140px] pointer-events-none" />
          <div className="blob-4 absolute top-[55%] left-[55%] w-[320px] h-[320px] rounded-full bg-primary/25 blur-[90px] pointer-events-none" />

          <div className="absolute inset-0 z-0 pointer-events-none ">
            <Grainient
              className=" inset-0"
              color1="#f0ede6"
              color2="#7d6ec8"
              color3="#f0ede6"
              timeSpeed={0.9}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5.5}
              warpSpeed={3}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.1}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
          <div className="w-full h-full bottom-0 absolute bg-gradient-to-b  from-transparent to-background"></div>
          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 px-5 text-center max-w-4xl w-full mt-16">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-primary leading-[0.95]">
              Descubre lo que
              <br />
              <span className="text-primary">te espera</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-black/70 font-semibold max-w-lg leading-relaxed">
              Explora y únete a los eventos disponibles
            </p>

            {/* Glass search bar */}
            <div className="search-glow w-full max-w-2xl mt-2 relative">
              <div
                className="search-glow-ring absolute -inset-[3px] rounded-[1.6rem] opacity-0 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                  filter: "blur(8px)",
                }}
              />
              <div className="relative flex items-center gap-4 bg-white/35 backdrop-blur-2xl border border-white/60 shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] rounded-full px-6 py-4 md:py-5">
                <Search
                  className="shrink-0 text-primary"
                  size={22}
                  strokeWidth={2.2}
                />
                <input
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent text-gray-800 placeholder:text-gray-500/80 text-base md:text-lg font-normal outline-none placeholder:max-sm:text-sm"
                  placeholder="Buscar eventos por título…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(0);
                    }}
                    className="shrink-0 cursor-pointer text-black hover:bg-black/10 p-1 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Events grid ── */}
        <div className="container relative py-16 pb-20 px-5 lg:px-14 max-w-full flex flex-col gap-10">
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
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  No hay eventos disponibles
                </h2>
              </div>
            ) : (
              listEvents.map((event, index) => {
                const pieno = event.registered_count >= event.capacity;
                const scaduto = isEventDatePast(event.date);
                const enrolled = isEnrolled(event.role);
                const organizer = isOrganizer(event.role);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isFull={pieno}
                    isExpired={scaduto}
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

          {!isLoadingGetEvents && (
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
          )}
        </div>
      </div>
    </>
  );
}
