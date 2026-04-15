import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import EventsService from "@/services/app/events/events.service";
import type { IEventParticipant } from "@/models/app/events/event-participants.model";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PAGE = 8;

export type EventParticipantsRoleEditMode = "full" | "promote-only";

type Props = {
  eventId: number;
  /** full: organizador/admin; promote-only: asistente del evento (solo promover a asistente). */
  roleEditMode: EventParticipantsRoleEditMode;
  onChanged?: () => Promise<void>;
  /** Incrementar desde el padre para recargar el listado (p. ej. tras asignar usuario desde el formulario). */
  refreshVersion?: number;
};

function roleLabel(r: IEventParticipant["role"]) {
  if (r === "organizador") return "Organizador";
  if (r === "asistente") return "Asistente";
  return "Participante";
}

function isSameUserAsViewer(rowEmail: string, viewerEmail: string | undefined) {
  if (!viewerEmail) return false;
  return rowEmail.trim().toLowerCase() === viewerEmail.trim().toLowerCase();
}

export function EventParticipantsList({ eventId, roleEditMode, onChanged, refreshVersion = 0 }: Props) {
  const { user: authUser } = useAuth();
  const viewerEmail = authUser?.sub;

  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 350);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<IEventParticipant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await EventsService.listEventRegistrations(eventId, {
        q: debounced,
        skip: String(page * PAGE),
        limit: String(PAGE),
      });
      setItems(resp.items);
      setTotal(resp.total);
    } catch {
      toast.error("No se pudieron cargar las personas del evento");
    } finally {
      setLoading(false);
    }
  }, [eventId, debounced, page]);

  useEffect(() => {
    void load();
  }, [load, refreshVersion]);

  useEffect(() => {
    setPage(0);
  }, [debounced, eventId]);

  const emitChanged = async () => {
    await load();
    await onChanged?.();
  };

  const remove = async (userId: number) => {
    try {
      await EventsService.removeEventRegistration(eventId, userId);
      toast.success("Persona retirada del evento");
      await emitChanged();
    } catch {
      toast.error("No se pudo eliminar la inscripción");
    }
  };

  const setRole = async (userId: number, role: "usuario" | "asistente", successMsg?: string) => {
    try {
      await EventsService.updateEventRegistrationRole(eventId, userId, role, () => {});
      toast.success(successMsg ?? "Rol actualizado");
      await emitChanged();
    } catch {
      toast.error("No se pudo actualizar el rol");
    }
  };

  const transferOrganizerTo = async (userId: number, displayName: string) => {
    if (!window.confirm(`¿Trasladar la organización del evento a «${displayName}»?`)) return;
    try {
      await EventsService.transferOrganizer(eventId, userId);
      toast.success("Titular del evento actualizado");
      await emitChanged();
    } catch {
      toast.error("No se pudo trasladar la organización");
    }
  };

  const onFullModeRoleSelect = async (row: IEventParticipant, value: string) => {
    if (row.role === "organizador") return;
    if (value === row.role) return;
    if (value === "organizador") {
      await transferOrganizerTo(row.user_id, row.name);
      return;
    }
    if (value === "usuario" || value === "asistente") {
      await setRole(row.user_id, value);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="flex flex-col gap-3 w-full border-t border-border/60 pt-4 mt-2">
      <h4 className="text-sm font-semibold text-foreground">Personas en este evento</h4>
      <p className="text-xs text-muted-foreground">
        Orden: organizador, asistentes y participantes. El rol «Organizador» es la titularidad del evento; puedes
        trasladarla a otra persona desde el desplegable (modo completo).
      </p>
      {roleEditMode === "promote-only" ? (
        <p className="text-xs text-muted-foreground">
          No verás la opción de quitar a nadie del evento. En tu propia fila como asistente, usa «Abandonar» para dejar
          de ser asistente y seguir como participante.
        </p>
      ) : null}
      <Input placeholder="Buscar por nombre o email…" value={q} onChange={(e) => setQ(e.target.value)} />
      {loading ? <p className="text-xs text-muted-foreground">Cargando…</p> : null}
      <ul className="divide-y rounded-md border max-h-[280px] overflow-y-auto bg-background/40">
        {items.length === 0 ? (
          <li className="p-3 text-sm text-muted-foreground">Sin resultados</li>
        ) : (
          items.map((row) => (
            <li
              key={`${row.user_id}-${row.role}`}
              className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground truncate">{row.email}</p>
              </div>

              {roleEditMode === "full" ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 shrink-0">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Rol en el evento</label>
                    <select
                      className={cn(
                        "h-9 min-w-[11rem] rounded-md border border-input bg-background px-2 text-sm",
                        row.role === "organizador" && "opacity-90"
                      )}
                      value={row.role}
                      disabled={row.role === "organizador"}
                      onChange={(e) => void onFullModeRoleSelect(row, e.target.value)}
                    >
                      <option value="organizador">{roleLabel("organizador")}</option>
                      <option value="asistente">{roleLabel("asistente")}</option>
                      <option value="usuario">{roleLabel("usuario")}</option>
                    </select>
                  </div>
                  {row.role !== "organizador" ? (
                    <Button type="button" size="sm" variant="destructive" onClick={() => remove(row.user_id)}>
                      Quitar del evento
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col gap-1 sm:items-end">
                  <p className="text-xs font-medium text-primary/90">{roleLabel(row.role)}</p>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {row.role === "usuario" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setRole(row.user_id, "asistente")}
                      >
                        Hacer asistente
                      </Button>
                    ) : row.role === "asistente" && isSameUserAsViewer(row.email, viewerEmail) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRole(row.user_id, "usuario", "Has abandonado el rol de asistente; sigues como participante.")
                        }
                      >
                        Abandonar
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
      {total > PAGE ? (
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Página {page + 1} / {totalPages} · {total}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(page + 1) * PAGE >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
