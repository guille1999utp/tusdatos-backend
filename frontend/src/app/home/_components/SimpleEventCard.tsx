import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";

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
  index: number;
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
  const roleBadge = getRoleBadge(event.role);

  return (
    <div
      className={`group relative  border-2 border-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] transition-all duration-700 ${
        isExpired ? "opacity-75" : ""
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-1000 group-hover:scale-105 bg-background" />

      {/* Content */}
      <div className="relative h-full w-full p-5 sm:p-6 lg:p-7 flex flex-col justify-between z-20">
        {/* Header: date + capacity */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-black text-base md:text-lg font-bold tracking-widest uppercase">
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="mr-1 inline size-5 md:size-7"
            />
            {event.date}
          </div>
          <div className="inline-flex items-center gap-2 bg-tertiary text-black border-2 border-white backdrop-blur-xl px-3 py-1.5 rounded-full font-bold tracking-tight text-lg sm:text-xl shadow-sm">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="shrink-0 size-5 sm:size-6 text-black"
            />
            {event.registered_count} / {event.capacity}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Badges */}
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
          <h3 className="text-[clamp(1.6rem,5vw,3.5rem)] font-black leading-[0.85] tracking-tighter text-primary">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm sm:text-base text-black/70 line-clamp-2 leading-tight font-semibold">
              {event.description}
            </p>
          )}

          {/* Detail link */}
          {showDetailLink && (
            <Link
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver detalle y sesiones
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Link>
          )}
        </div>

        {/* Footer: leave button */}
        {canLeave && (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLeave?.();
            }}
            disabled={isLeaving}
            className="mt-4 w-full h-14 md:h-16 rounded-[2.5rem] font-bold text-lg border-2 border-white bg-red-500/80 hover:bg-red-600 text-white shadow-lg transition-all duration-300"
          >
            {isLeaving ? "Procesando…" : "Dejar evento"}
          </Button>
        )}
      </div>
    </div>
  );
}
