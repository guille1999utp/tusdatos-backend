import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";
import { DataTableDemo } from "@/components/common/organisms/table/DataTable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTableListEvents } from "@/hooks/app/events/useTableEvents";
import { FormAssignUser } from "@/modules/app/events/components/FormAssignUser";
import { FormEvents } from "@/modules/app/events/components/FormEvents";
import { useAuth } from "@/hooks/useAuth";
import { AdminEventRegistrations } from "@/modules/app/admin/AdminEventRegistrations";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Events = () => {
  const { user } = useAuth();
  const canCreate = Boolean(user);

  const {
    listMyEvents,
    onMounted,
    columns,
    openDialogEvents,
    setOpenDialogEvents,
    currentEventsState,
    setCurrentEventsState,
    dialogConfirmDelete,
    setDialogConfirmDelete,
    handleDelete,
    isLoadingDeleteEvents,
    handleCloseEventsDialog,
    openDialogAssignUser,
    handleCloseAssignUser,
    // search,
    // setSearch,
    // page,
    // setPage,
    totalMyEvents,
    // pageSize,
    regOpen,
    setRegOpen,
  } = useTableListEvents();

  // const totalPages = Math.max(1, Math.ceil(totalMyEvents / pageSize));
  const mineCount = listMyEvents.filter((e) => e.role === "organizador").length;
  const assistantCount = listMyEvents.filter(
    (e) => e.role === "asistente",
  ).length;

  return (
    <>
      <div className=" max-w-full  flex flex-col gap-10">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center  gap-5">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="h-8 text-center mx-2 bg-black/50 hidden"
              />
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
                Mis Eventos
              </h1>
            </div>
          </div>
          {canCreate ? (
            <Button
              className="md:ml-auto cursor-pointer shrink-0 md:h-12"
              variant="main"
              onClick={() => {
                setCurrentEventsState(null);
                setOpenDialogEvents(true);
              }}
            >
              Crear Evento
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Eventos listados</p>
            <p className="text-xl font-semibold">{totalMyEvents}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Eventos míos</p>
            <p className="text-xl font-semibold">{mineCount}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Como asistente</p>
            <p className="text-xl font-semibold">{assistantCount}</p>
          </div>
        </div>

        {/* <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-md space-y-1">
            <label className="text-sm text-muted-foreground">
              Buscar por título
            </label>
            <Input
              placeholder="Nombre del evento…"
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
              Página {page + 1} / {totalPages} · {totalMyEvents} eventos
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(page + 1) * pageSize >= totalMyEvents}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div> */}

        <DataTableDemo columns={columns} data={listMyEvents} />
      </div>
      <MainDialog
        title="Eventos"
        open={openDialogEvents}
        setOpenModal={(o) => {
          if (!o) handleCloseEventsDialog();
        }}
      >
        <FormEvents
          onMounted={onMounted}
          closeModal={handleCloseEventsDialog}
          currentEventsState={currentEventsState}
        />
      </MainDialog>

      <MainDialog
        title="Eventos"
        open={dialogConfirmDelete.open}
        setOpenModal={(o) => {
          if (!o) setDialogConfirmDelete({ open: false, id: 0 });
        }}
      >
        <Button
          onClick={() => handleDelete(dialogConfirmDelete.id)}
          disabled={isLoadingDeleteEvents}
          color="error"
        >
          <>{isLoadingDeleteEvents ? "loading..." : "Delete"}</>
        </Button>
      </MainDialog>

      <MainDialog
        title="Asignar"
        open={openDialogAssignUser.open}
        setOpenModal={(o) => {
          if (!o) handleCloseAssignUser();
        }}
        customMaxWidth="sm:max-w-2xl"
      >
        {openDialogAssignUser.open ? (
          <FormAssignUser
            key={`${openDialogAssignUser.id}-${openDialogAssignUser.soloParticipantes}`}
            closeModal={handleCloseAssignUser}
            onMounted={onMounted}
            idEvent={openDialogAssignUser.id}
            soloParticipantes={openDialogAssignUser.soloParticipantes}
          />
        ) : null}
      </MainDialog>

      {user?.role === "admin" ? (
        <MainDialog
          title="Inscripciones (admin)"
          open={regOpen.open}
          setOpenModal={(o) => {
            if (!o) setRegOpen({ open: false, id: 0 });
          }}
        >
          {regOpen.open ? (
            <AdminEventRegistrations
              eventId={regOpen.id}
              onEventsListRefresh={onMounted}
            />
          ) : null}
        </MainDialog>
      ) : null}
    </>
  );
};
