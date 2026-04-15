import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { IEvents } from "@/models/app/events/events.model"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

type EventRowActionsOpts = {
  globalRole: string
  /** Panel admin: abre gestión de inscritos del evento. */
  onRegistrations?: (eventId: number) => void
  /** Abre detalle/gestión de sesiones del evento. */
  onManageSessions?: (eventId: number) => void
}

function rowActionFlags(globalRole: string, eventRole: string | null | undefined) {
  if (globalRole === "admin") {
    return { canEdit: true, canDelete: true, canAssign: true }
  }
  const er = eventRole ?? ""
  const canEdit = er === "organizador"
  const canDelete = canEdit
  const canAssign = er === "organizador" || er === "asistente"
  return { canEdit, canDelete, canAssign }
}

export const columnsEvents = (
  handleOpenDialogAndSetCurrentWorkshops: (data: IEvents) => void,
  handleOpenConfirmDelete: (id: number) => void,
  handleOpenAssignUser: (id: number, soloParticipantes?: boolean) => void,
  opts: EventRowActionsOpts
) => [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
      <div className="capitalize">{String(row.getValue("title"))}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Mi rol",
    cell: ({ row }: { row: { original: IEvents } }) => {
      const role = row.original.role ?? "usuario"
      if (role === "organizador") {
        return (
          <span className="inline-flex rounded-md border border-violet-600/50 bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-900 dark:text-violet-100">
            Mío (Organizador)
          </span>
        )
      }
      if (role === "asistente") {
        return (
          <span className="inline-flex rounded-md border border-sky-600/50 bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-900 dark:text-sky-100">
            Asistente
          </span>
        )
      }
      return (
        <span className="inline-flex rounded-md border border-emerald-600/50 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
          Participante
        </span>
      )
    },
  },
  {
    accessorKey: "total_inscritos",
    header: () => <div className="text-center w-24">Inscritos</div>,
    cell: ({ row }: { row: { original: IEvents } }) => {
      const n = row.original.total_inscritos
      const v = typeof n === "number" && !Number.isNaN(n) ? n : 0
      return <div className="text-center w-24 text-sm tabular-nums font-medium">{v}</div>
    },
  },
  {
    accessorKey: "capacity",
    header: ({ column }: { column: { toggleSorting: (v: boolean) => void; getIsSorted: () => string | false } }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Capacidad
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
      <div className="lowercase">{String(row.getValue("capacity"))}</div>
    ),
  },
  {
    accessorKey: "state",
    header: () => <div className="text-right">Estado</div>,
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
      <div className="text-right font-medium">{String(row.getValue("state"))}</div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">Fecha</div>,
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
      <div className="text-right font-medium">{String(row.getValue("date"))}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: { row: { original: IEvents } }) => {
      const { canEdit, canDelete, canAssign } = rowActionFlags(opts.globalRole, row.original.role)
      const soloParticipantes = opts.globalRole !== "admin" && row.original.role === "asistente"
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {opts.onManageSessions ? (
                <DropdownMenuItem onClick={() => opts.onManageSessions!(Number(row.original.id))}>
                  {canEdit || opts.globalRole === "admin" ? "Gestionar sesiones" : "Ver sesiones"}
                </DropdownMenuItem>
              ) : null}
              {canEdit ? (
                <DropdownMenuItem onClick={() => handleOpenDialogAndSetCurrentWorkshops(row.original)}>
                  Editar
                </DropdownMenuItem>
              ) : null}
              {canAssign ? (
                <DropdownMenuItem
                  onClick={() => handleOpenAssignUser(Number(row.original.id), soloParticipantes)}
                >
                  Asignar participante
                </DropdownMenuItem>
              ) : null}
              {opts.onRegistrations ? (
                <DropdownMenuItem onClick={() => opts.onRegistrations!(Number(row.original.id))}>
                  Inscripciones
                </DropdownMenuItem>
              ) : null}
              {canDelete ? (
                <DropdownMenuItem onClick={() => handleOpenConfirmDelete(Number(row.original.id))}>
                  Eliminar
                </DropdownMenuItem>
              ) : null}
              {!canEdit && !canAssign && !canDelete ? (
                <DropdownMenuItem disabled>No hay acciones disponibles</DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
