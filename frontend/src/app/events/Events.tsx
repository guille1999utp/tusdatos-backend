// import { PinContainer } from "@/components/ui/3d-pin"
import { MainDialog } from "@/components/common/molecules/dialog/MainDialog"
import { DataTableDemo } from "@/components/common/organisms/table/DataTable"
import { AuroraText } from "@/components/magicui/aurora-text"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useTableListEvents } from "@/hooks/app/events/useTableEvents"
import { FormAssignUser } from "@/modules/app/events/components/FormAssignUser"
import { FormEvents } from "@/modules/app/events/components/FormEvents"
import { useAuth } from "@/hooks/useAuth"
import { AdminEventRegistrations } from "@/modules/app/admin/AdminEventRegistrations"

export const Events = () => {
  const { user } = useAuth()
  const canCreate = Boolean(user)

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
    search,
    setSearch,
    page,
    setPage,
    totalMyEvents,
    pageSize,
    regOpen,
    setRegOpen,
  } = useTableListEvents()

  const totalPages = Math.max(1, Math.ceil(totalMyEvents / pageSize))
  const mineCount = listMyEvents.filter((e) => e.role === "organizador").length
  const assistantCount = listMyEvents.filter((e) => e.role === "asistente").length

  return (
    <>
      <div className="container xl:py-8 md:pt-4 pt-5 pb-8 px-5 md:px-14 max-w-full bg-background flex flex-col mt-20 gap-10">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
          <h1 className="flex text-4xl font-bold md:text-5xl lg:text-7xl w-full text-slate-100/50">
            <AuroraText>Mis Eventos</AuroraText>
          </h1>
          {canCreate ? (
            <Button
              className="md:ml-auto cursor-pointer shrink-0"
              variant="outline"
              onClick={() => {
                setCurrentEventsState(null)
                setOpenDialogEvents(true)
              }}
            >
              Crear
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-md space-y-1">
            <label className="text-sm text-muted-foreground">Buscar por título</label>
            <Input
              placeholder="Nombre del evento…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
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
        <Separator />

        <DataTableDemo columns={columns} data={listMyEvents} />
      </div>
      <MainDialog
        title="Eventos"
        open={openDialogEvents}
        setOpenModal={(o) => {
          if (!o) handleCloseEventsDialog();
        }}
      >
        <FormEvents onMounted={onMounted} closeModal={handleCloseEventsDialog} currentEventsState={currentEventsState} />
      </MainDialog>

      <MainDialog
        title="Eventos"
        open={dialogConfirmDelete.open}
        setOpenModal={(o) => {
          if (!o) setDialogConfirmDelete({ open: false, id: 0 });
        }}
      >
        <Button onClick={() => handleDelete(dialogConfirmDelete.id)} disabled={isLoadingDeleteEvents} color="error">
          <>{isLoadingDeleteEvents ? "loading..." : "Delete"}</>
        </Button>
      </MainDialog>

      <MainDialog
        title="Asignar"
        open={openDialogAssignUser.open}
        setOpenModal={(o) => {
          if (!o) handleCloseAssignUser();
        }}
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
            if (!o) setRegOpen({ open: false, id: 0 })
          }}
        >
          {regOpen.open ? (
            <AdminEventRegistrations eventId={regOpen.id} onEventsListRefresh={onMounted} />
          ) : null}
        </MainDialog>
      ) : null}
    </>
  )
}
