import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type RoleBadge = {
  label: string;
  className: string;
};

function getRoleBadge(role: string | null | undefined): RoleBadge | null {
  if (role === "organizador")
    return {
      label: "Organizador",
      className:
        "bg-violet-500/20 font-bold py-3 px-4 text-violet-700 border-violet-500/40 backdrop-blur-md uppercase",
    };
  if (role === "asistente")
    return {
      label: "Asistente",
      className:
        "bg-sky-500/20 font-bold py-3 px-4 text-sky-700 border-sky-500/40 backdrop-blur-md uppercase",
    };
  if (role === "usuario")
    return {
      label: "Participante",
      className:
        "bg-emerald-500/20 font-bold py-3 px-4 text-emerald-700 border-emerald-500/40 backdrop-blur-md uppercase",
    };
  return null;
}

interface SimpleEventCardProps {
  event: any;
  isExpired?: boolean;
  isFull?: boolean;
  /** If true, shows a "Dejar evento" button */
  canLeave?: boolean;
  onLeave?: () => void;
  isLeaving?: boolean;
  showDetailLink?: boolean;
}

export default function SimpleEventCard({
  event,
  isExpired = false,
  isFull = false,
  canLeave = false,
  onLeave,
  isLeaving = false,
  showDetailLink = true,
}: SimpleEventCardProps) {
  const navigate = useNavigate();
  const roleBadge = getRoleBadge(event.role);
  const detailPath = `/events/${event.id}`;

  const handleCardNavigate = (e: { target: EventTarget | null }) => {
    const el = e.target as HTMLElement;
    if (el.closest("a, button")) return;
    navigate(detailPath);
  };

  return (
    <div
      onClick={handleCardNavigate}
      className={cn(
        "group relative min-h-[280px] cursor-pointer overflow-hidden rounded-[3rem] border-2 border-white shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] transition-all duration-700 md:min-h-[320px] md:rounded-[4rem]",
        isExpired && "opacity-75",
        isExpired &&
          "ring-4 ring-red-500/70 ring-offset-2 ring-offset-background border-red-400/90",
        isFull &&
          !isExpired &&
          "ring-4 ring-amber-400/80 ring-offset-2 ring-offset-background border-amber-300/90",
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-1000 group-hover:scale-105 bg-background" />

      {/* Content */}
      <div className="relative h-full w-full p-5 sm:p-6 2xl:p-8 flex flex-col justify-between z-20">
        {/* Header: date + capacity + mismo botón que en el home (EventCard) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-black text-base md:text-lg 2xl:text-xl font-bold tracking-widest uppercase min-w-0">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="mr-1 2xl:mr-2 inline size-5 md:size-7 shrink-0"
              />
              <span className="truncate">{event.date}</span>
            </div>
            <div className="inline-flex items-center gap-3 bg-tertiary text-black border-2 border-white backdrop-blur-xl px-4 py-2 2xl:px-6 2xl:py-3 rounded-full font-bold tracking-tight text-xl sm:text-xl 2xl:text-3xl shadow-sm shrink-0">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="shrink-0 size-6 2xl:size-8 text-black"
              />
              {event.registered_count} / {event.capacity}
            </div>
          </div>
          {showDetailLink ? (
            <div className="relative z-30 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-2 border-primary/40 bg-white/80 font-semibold text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <Link to={detailPath} onClick={(e) => e.stopPropagation()}>
                  Ver detalle y sesiones
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-wrap gap-2">
            {roleBadge && (
              <Badge className={roleBadge.className}>{roleBadge.label}</Badge>
            )}
            {isExpired && (
              <Badge
                variant="destructive"
                className="bg-red-500/20 py-3 px-4 font-bold text-red-600 border-red-500/40 backdrop-blur-md uppercase"
              >
                Expirado
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-orange-500/20 font-bold py-3 px-4 text-orange-600 border-orange-500/40 backdrop-blur-md uppercase">
                Cupo Lleno
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-black leading-[0.85] tracking-tighter text-primary">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm sm:text-base text-black/70 line-clamp-2 leading-tight font-semibold">
              {event.description}
            </p>
          )}
        </div>

        {/* Footer: mismo estilo que el CTA inferior de EventCard (home) */}
        {canLeave && (
          <Button
            type="button"
            variant="main"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLeave?.();
            }}
            disabled={isLeaving}
            className="group/btn relative z-30 mt-4 flex h-16 w-full items-center justify-center gap-4 rounded-[2.5rem] border-2 border-white font-bold text-xl shadow-xl transition-all duration-500 hover:shadow-2xl md:h-20 xl:text-xl 2xl:text-2xl bg-red-500/80 text-white hover:bg-red-600 disabled:opacity-70"
          >
            {isLeaving ? "Procesando…" : "Dejar evento"}
          </Button>
        )}
      </div>
    </div>
  );
}
