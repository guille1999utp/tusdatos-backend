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
      <div className=" max-w-full  flex flex-col gap-5 md:gap-8">
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
              className="md:ml-auto cursor-pointer shrink-0 h-12"
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

        <div className="grid gap-1 md:gap-3 grid-cols-3">
          <div className="rounded-3xl space-y-2 shadow-xl p-4 bg-tertiary">
            <p className="text-xs md:text-sm text-black">Eventos listados</p>
            <p className="text-4xl xl:text-6xl font-semibold">
              {totalMyEvents}
            </p>
          </div>
          <div className="rounded-3xl space-y-2 shadow-xl p-4 bg-secondary">
            <p className="text-xs md:text-sm text-black">Eventos míos</p>
            <p className="text-4xl xl:text-6xl font-semibold text-white">
              {mineCount}
            </p>
          </div>
          <div className="rounded-3xl space-y-2 shadow-xl p-4 bg-tertiary">
            <p className="text-xs md:text-sm text-black">Como asistente</p>
            <p className="text-4xl xl:text-6xl font-semibold">
              {assistantCount}
            </p>
          </div>
        </div>

        <DataTableDemo columns={columns} data={listMyEvents} />
      </div>
      <MainDialog
        title={currentEventsState ? "Actualizar evento" : "Crear evento"}
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
        title="Eliminar evento"
        open={dialogConfirmDelete.open}
        setOpenModal={(o) => {
          if (!o) setDialogConfirmDelete({ open: false, id: 0 });
        }}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que quieres eliminar este evento?
          </p>
        </div>
        <Button
          variant={"destructive"}
          onClick={() => handleDelete(dialogConfirmDelete.id)}
          disabled={isLoadingDeleteEvents}
          className="h-12 bg-destructive hover:bg-destructive/80 text-white md:text-lg"
        >
          <>{isLoadingDeleteEvents ? "cargando..." : "Eliminar evento"}</>
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
          customMaxWidth="sm:max-w-2xl"
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
