import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import type { IEvents } from "@/models/app/events/events.model";
import type {
  IEventSessionCreate,
  IEventSession,
} from "@/models/app/events/event-sessions.model";
import EventsService from "@/services/app/events/events.service";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isEnrolled(role: string | null | undefined): boolean {
  return role === "usuario" || role === "asistente";
}

const defaultSessionForm: IEventSessionCreate = {
  title: "",
  speaker: "",
  start_time: "",
  end_time: "",
  capacity: 1,
};

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<IEvents | null>(null);
  const [sessions, setSessions] = useState<IEventSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionForm, setSessionForm] =
    useState<IEventSessionCreate>(defaultSessionForm);

  const parsedId = Number(eventId);

  const canManageSessions = useMemo(
    () => user?.role === "admin" || event?.role === "organizador",
    [user?.role, event?.role],
  );

  const loadEventData = useCallback(async () => {
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      toast.error("ID de evento inválido");
      navigate("/all-events");
      return;
    }

    setLoading(true);
    try {
      const [eventResp, sessionsResp] = await Promise.all([
        EventsService.getById(parsedId),
        EventsService.getSessions(parsedId),
      ]);
      setEvent(eventResp);
      setSessions(
        [...sessionsResp].sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        ),
      );
    } catch {
      toast.error("No se pudo cargar el detalle del evento");
      navigate("/all-events");
    } finally {
      setLoading(false);
    }
  }, [navigate, parsedId]);

  useEffect(() => {
    void loadEventData();
  }, [loadEventData]);

  const handleSubscribe = async () => {
    if (!event) return;
    try {
      await EventsService.subscribe({ id: event.id }, (msg) =>
        toast.error(msg || "No se pudo completar la inscripción"),
      );
      toast.success("Inscripción completada");
      await loadEventData();
    } catch {
      // El error de negocio ya llega por callback.
    }
  };

  const handleLeave = async () => {
    if (!event) return;
    try {
      await EventsService.leaveEventSelf(event.id);
      toast.success("Has abandonado el evento");
      await loadEventData();
    } catch {
      toast.error("No se pudo abandonar el evento");
    }
  };

  const handleCreateSession = async () => {
    if (!event) return;
    setSavingSession(true);
    try {
      await EventsService.createSession(event.id, sessionForm, (msg) =>
        toast.error(msg || "No se pudo crear la sesión"),
      );
      toast.success("Sesión creada");
      setSessionForm(defaultSessionForm);
      await loadEventData();
    } catch {
      // El error de negocio ya llega por callback.
    } finally {
      setSavingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-24 px-6 text-muted-foreground flex items-center justify-center text-2xl">
        Cargando detalle del evento...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mt-24 px-6 text-muted-foreground">
        No se encontró el evento.
      </div>
    );
  }

  const enrolled = isEnrolled(event.role);
  const isOrganizer = event.role === "organizador";

  return (
    <div className="space-y-6">
      <div className="flex items-center  gap-3">
        <Link to="/all-events">
          <Button
            type="button"
            variant="main"
            className="h-10 md:h-12 hover:drop-shadow-none"
          >
            <ChevronLeft size={15} className="size-5 md:size-7" />{" "}
          </Button>
        </Link>
        <h1 className="text-2xl order-1 md:order-2 sm:text-3xl md:text-4xl font-bold text-primary">
          {event.title}
        </h1>
      </div>

      <div className="rounded-4xl bg-tertiary border p-4 space-y-2 text-sm md:text-base ">
        <p>
          <strong>Descripción:</strong> {event.description}
        </p>
        <p>
          <strong>Fecha:</strong> {event.date}
        </p>
        <p>
          <strong>Estado:</strong> {event.state}
        </p>
        <p>
          <strong>Capacidad:</strong> {event.capacity}
        </p>
        <p>
          <strong>Participantes:</strong>{" "}
          {event.total_inscritos ?? event.registered_count}
        </p>
        <p>
          <strong>Tu rol:</strong> {event.role ?? "sin rol en este evento"}
        </p>

        {!isOrganizer && !enrolled ? (
          <button
            type="button"
            className="mt-2 h-10 md:h-12 rounded-full border-2 border-white active:scale-95 transition-all cursor-pointer bg-green-600 px-4 text-white hover:bg-green-700"
            onClick={handleSubscribe}
          >
            Inscribirme al evento
          </button>
        ) : null}

        {enrolled ? (
          <Button
            type="button"
            variant="main"
            className="mt-2 bg-destructive h-10 md:h-12 text-white hover:bg-destructive hover:drop-shadow-none"
            onClick={handleLeave}
          >
            Dejar evento
          </Button>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sesiones del evento</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este evento aún no tiene sesiones programadas.
          </p>
        ) : (
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-3xl border p-3 border-primary  text-sm md:text-base bg-secondary "
              >
                <p className="font-semibold text-base md:text-lg text-black">
                  {session.title}
                </p>
                <p className="text-sm text-white">Ponente: {session.speaker}</p>
                <p className="text-sm text-white">
                  {formatDateTime(session.start_time)} -{" "}
                  {formatDateTime(session.end_time)}
                </p>
                <p className="text-sm text-white">
                  Capacidad: {session.capacity}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {canManageSessions ? (
        <section className="space-y-3 rounded-4xl border p-4">
          <h3 className="text-lg md:text-xl font-semibold">Crear sesión</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs text-black">Título de la sesión</Label>
              <Input
                className="h-11 shadow-none"
                placeholder="Ej. Taller de React"
                value={sessionForm.title}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-black">Ponente</Label>
              <Input
                className="h-11 shadow-none"
                placeholder="Nombre del expositor"
                value={sessionForm.speaker}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    speaker: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-black">
                Fecha y hora de inicio
              </Label>
              <Input
                className="h-11 shadow-none"
                type="datetime-local"
                value={sessionForm.start_time}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    start_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-black">Fecha y hora de fin</Label>
              <Input
                className="h-11 shadow-none"
                type="datetime-local"
                value={sessionForm.end_time}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    end_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-black">
                Capacidad de la sesión
              </Label>
              <Input
                className="h-11 shadow-none"
                type="number"
                min={1}
                value={sessionForm.capacity}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    capacity: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Valor por defecto: 1 participante. Debe ser mayor a 0 y no
                superar la capacidad del evento.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="main"
            className="h-12 "
            onClick={handleCreateSession}
            disabled={savingSession}
          >
            {savingSession ? "Guardando..." : "Crear sesión"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}
