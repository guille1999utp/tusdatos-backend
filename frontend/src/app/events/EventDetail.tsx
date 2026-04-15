import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "@/hooks/useAuth";
import type { IEvents } from "@/models/app/events/events.model";
import type { IEventSessionCreate, IEventSession } from "@/models/app/events/event-sessions.model";
import EventsService from "@/services/app/events/events.service";

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
  const [sessionForm, setSessionForm] = useState<IEventSessionCreate>(defaultSessionForm);

  const parsedId = Number(eventId);

  const canManageSessions = useMemo(
    () => user?.role === "admin" || event?.role === "organizador",
    [user?.role, event?.role]
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
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
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
      await EventsService.subscribe(
        { id: event.id },
        (msg) => toast.error(msg || "No se pudo completar la inscripción")
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
        toast.error(msg || "No se pudo crear la sesión")
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
    return <div className="container mt-24 px-6 text-muted-foreground">Cargando detalle del evento...</div>;
  }

  if (!event) {
    return <div className="container mt-24 px-6 text-muted-foreground">No se encontró el evento.</div>;
  }

  const enrolled = isEnrolled(event.role);
  const isOrganizer = event.role === "organizador";

  return (
    <div className="container mt-20 px-5 md:px-14 pb-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
        <Link className="text-sm text-primary hover:underline" to="/all-events">
          Volver al listado
        </Link>
      </div>

      <div className="rounded-lg border p-4 space-y-2 bg-background/50">
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
          <strong>Participantes:</strong> {event.total_inscritos ?? event.registered_count}
        </p>
        <p>
          <strong>Tu rol:</strong> {event.role ?? "sin rol en este evento"}
        </p>

        {!isOrganizer && !enrolled ? (
          <button
            type="button"
            className="mt-2 h-9 rounded-md bg-green-600 px-4 text-white hover:bg-green-700"
            onClick={handleSubscribe}
          >
            Inscribirme al evento
          </button>
        ) : null}

        {enrolled ? (
          <button
            type="button"
            className="mt-2 h-9 rounded-md border border-destructive/60 px-4 text-destructive hover:bg-destructive/10"
            onClick={handleLeave}
          >
            Dejar evento
          </button>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sesiones del evento</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este evento aún no tiene sesiones programadas.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-md border p-3">
                <p className="font-medium">{session.title}</p>
                <p className="text-sm text-muted-foreground">Ponente: {session.speaker}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(session.start_time)} - {formatDateTime(session.end_time)}
                </p>
                <p className="text-sm text-muted-foreground">Capacidad: {session.capacity}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {canManageSessions ? (
        <section className="space-y-3 rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Crear sesión</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Título de la sesión</label>
              <input
                className="h-9 w-full rounded-md border px-3"
                placeholder="Ej. Taller de React"
                value={sessionForm.title}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Ponente</label>
              <input
                className="h-9 w-full rounded-md border px-3"
                placeholder="Nombre del expositor"
                value={sessionForm.speaker}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, speaker: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha y hora de inicio</label>
              <input
                className="h-9 w-full rounded-md border px-3"
                type="datetime-local"
                value={sessionForm.start_time}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha y hora de fin</label>
              <input
                className="h-9 w-full rounded-md border px-3"
                type="datetime-local"
                value={sessionForm.end_time}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Capacidad de la sesión</label>
              <input
                className="h-9 w-full rounded-md border px-3"
                type="number"
                min={1}
                value={sessionForm.capacity}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Valor por defecto: 1 participante. Debe ser mayor a 0 y no superar la capacidad del evento.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-60"
            onClick={handleCreateSession}
            disabled={savingSession}
          >
            {savingSession ? "Guardando..." : "Crear sesión"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
