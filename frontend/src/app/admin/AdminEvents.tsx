import { useCallback, useEffect, useMemo, useState } from "react";
import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";
import { DataTableDemo } from "@/components/common/organisms/table/DataTable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  deleteEvents,
  getAllEvents,
} from "@/redux/features/events/events.thunks";
import { columnsEvents } from "@/modules/app/events/adapters/EventColumns";
import { FormEvents } from "@/modules/app/events/components/FormEvents";
import { FormAssignUser } from "@/modules/app/events/components/FormAssignUser";
import { AdminEventRegistrations } from "@/modules/app/admin/AdminEventRegistrations";
import type { IEvents } from "@/models/app/events/events.model";
import { toast } from "react-toastify";
import { useDebounce } from "@/lib/useDebounce";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_SIZE = 10;

export default function AdminEvents() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    listEvents,
    totalListEvents,
    isLoadingGetEvents,
    isLoadingDeleteEvents,
  } = useAppSelector((s) => s.events);

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

  const refresh = useCallback(async () => {
    await dispatch(getAllEvents({ filters }));
  }, [dispatch, filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const [openEdit, setOpenEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvents | null | undefined>(
    undefined,
  );
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  });
  const [assignOpen, setAssignOpen] = useState<{
    open: boolean;
    id: number;
    soloParticipantes: boolean;
  }>({
    open: false,
    id: 0,
    soloParticipantes: false,
  });
  const [regOpen, setRegOpen] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  });

  const handleDelete = async (id: number) => {
    const r = await dispatch(deleteEvents({ params: { id } }));
    if (r.meta.requestStatus === "fulfilled") {
      toast.success("Evento eliminado");
      await refresh();
    }
    setConfirmDel({ open: false, id: 0 });
  };

  const columns = columnsEvents(
    (ev) => {
      setCurrentEvent(ev);
      setOpenEdit(true);
    },
    (id) => setConfirmDel({ open: true, id }),
    (id, soloParticipantes) =>
      setAssignOpen({ open: true, id, soloParticipantes: !!soloParticipantes }),
    {
      globalRole: "admin",
      onRegistrations: (id) => setRegOpen({ open: true, id }),
      onManageSessions: (id) => navigate(`/events/${id}`),
    },
  );

  const totalPages = Math.max(1, Math.ceil(totalListEvents / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-2 mb-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="h-8 text-center mx-2 bg-black/50 hidden"
            />
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
              Eventos
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Consulta todos los eventos, edítalos, elimínalos o gestiona
            inscripciones y asistentes.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => {
            setCurrentEvent(null);
            setOpenEdit(true);
          }}
        >
          Crear evento
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-md space-y-1">
          <label className="text-sm text-muted-foreground">
            Buscar por título
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
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Página {page + 1} / {totalPages} · {totalListEvents}
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
      <DataTableDemo columns={columns} data={listEvents} />

      <MainDialog
        title="Editar evento"
        open={openEdit}
        setOpenModal={(open) => {
          if (!open) setOpenEdit(false);
        }}
      >
        <FormEvents
          onMounted={refresh}
          closeModal={() => setOpenEdit(false)}
          currentEventsState={currentEvent ?? null}
        />
      </MainDialog>

      <MainDialog
        title="Confirmar eliminación"
        open={confirmDel.open}
        setOpenModal={(open) => {
          if (!open) setConfirmDel({ open: false, id: 0 });
        }}
      >
        <Button
          disabled={isLoadingDeleteEvents}
          variant="destructive"
          onClick={() => handleDelete(confirmDel.id)}
        >
          {isLoadingDeleteEvents ? "Eliminando…" : "Eliminar evento"}
        </Button>
      </MainDialog>

      <MainDialog
        title="Asignar usuario"
        open={assignOpen.open}
        setOpenModal={(open) => {
          if (!open)
            setAssignOpen({ open: false, id: 0, soloParticipantes: false });
        }}
        customMaxWidth="sm:max-w-xl"
      >
        {assignOpen.open ? (
          <FormAssignUser
            key={`${assignOpen.id}-${assignOpen.soloParticipantes}`}
            idEvent={assignOpen.id}
            soloParticipantes={assignOpen.soloParticipantes}
            onMounted={refresh}
            closeModal={() =>
              setAssignOpen({ open: false, id: 0, soloParticipantes: false })
            }
          />
        ) : null}
      </MainDialog>

      <MainDialog
        title="Inscripciones"
        open={regOpen.open}
        setOpenModal={(open) => {
          if (!open) setRegOpen({ open: false, id: 0 });
        }}
      >
        {regOpen.open ? (
          <AdminEventRegistrations
            eventId={regOpen.id}
            onEventsListRefresh={refresh}
          />
        ) : null}
      </MainDialog>
    </div>
  );
}
