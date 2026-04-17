import { useCallback, useEffect, useMemo, useState } from "react";
import { MainDialog } from "@/components/common/molecules/dialog/MainDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/lib/useDebounce";
import UsersService from "@/services/app/users/users.service";
import type { IUsers } from "@/models/app/users/users.model";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE = 10;
const ROLES = ["admin", "usuario"] as const;

export default function AdminUsers() {
  const { logout } = useAuth();
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 400);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<IUsers[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draftRoles, setDraftRoles] = useState<Record<number, string>>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({ open: false, id: 0, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(
    () => ({
      skip: String(page * PAGE),
      limit: String(PAGE),
      ...(debounced.trim() ? { q: debounced.trim() } : {}),
    }),
    [page, debounced],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await UsersService.search(filters);
      setItems(resp.items);
      setTotal(resp.total);
      const next: Record<number, string> = {};
      for (const u of resp.items) next[u.id] = u.role;
      setDraftRoles(next);
    } catch {
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRole = async (userId: number) => {
    const role = draftRoles[userId];
    if (!role) return;
    try {
      const resp = await UsersService.updateRole(userId, role, (msg) => {
        toast.error(msg || "No se pudo actualizar el rol");
      });
      toast.success("Rol actualizado");
      if (resp.logout_required) {
        toast.error(
          "Cerrando sesión: tu cuenta ya no tiene rol de administrador.",
        );
        logout();
        return;
      }
      await load();
    } catch {
      /* 400: el mensaje ya se mostró en errorCallback; otros errores suelen ir por handleApiErrors/toast global */
    }
  };

  const removeUser = (userId: number, label: string) => {
    setDeleteDialog({ open: true, id: userId, name: label });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setIsDeleting(true);
    try {
      await UsersService.deleteUser(deleteDialog.id, (msg) => {
        toast.error(msg || "No se pudo eliminar el usuario");
      });
      toast.success("Usuario eliminado");
      await load();
    } catch {
      /* Error handling */
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, id: 0, name: "" });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-3xl space-y-2 md:mb-6">
        <div className="flex items-center gap-5">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="h-8 text-center mx-2 bg-black/50 hidden"
          />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl text-primary">
            Admin Usuarios
          </h1>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Busca usuarios por nombre o correo y asigna el rol global (admin o
          usuario). Debe existir siempre al menos un administrador.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-md space-y-1">
          {loading ? (
            <Skeleton className="h-10 w-full rounded-2xl" />
          ) : (
            <Input
              placeholder="Buscar por nombre o email…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              className="shadow-none"
            />
          )}
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden">
        {loading ? (
          <div>
            <div className="h-12 bg-muted/30 border-b flex items-center px-4 gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 flex items-center px-4 border-b gap-4"
              >
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-10 flex-1 rounded-md" />
                <div className="flex-1 flex justify-end gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={draftRoles[u.id] ?? u.role}
                      onValueChange={(val) =>
                        setDraftRoles((prev) => ({
                          ...prev,
                          [u.id]: val,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full h-9! md:h-11!">
                        <SelectValue placeholder={draftRoles[u.id] ?? u.role} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-black">Rol</SelectLabel>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              <span className="capitalize">{r}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-base!"
                        onClick={() => saveRole(u.id)}
                        disabled={(draftRoles[u.id] ?? u.role) === u.role}
                      >
                        Guardar rol
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void removeUser(u.id, u.name || u.email)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 justify-end">
        {loading ? (
          <>
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      <MainDialog
        title="Eliminar usuario"
        open={deleteDialog.open}
        setOpenModal={(o) => {
          if (!o) setDeleteDialog({ open: false, id: 0, name: "" });
        }}
      >
        <div className="flex flex-col gap-2 md:gap-4">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que quieres eliminar por completo al usuario{" "}
            <strong>«{deleteDialog.name}»</strong>? Se borrarán todos sus
            eventos e inscripciones asociadas. Esta acción no se puede deshacer.
          </p>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="h-12 bg-destructive hover:bg-destructive/80 text-white md:text-lg rounded-full"
          >
            {isDeleting ? "Eliminando..." : "Eliminar usuario"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialog({ open: false, id: 0, name: "" })}
            disabled={isDeleting}
            className="h-12 border-2 rounded-full md:text-lg"
          >
            Cancelar
          </Button>
        </div>
      </MainDialog>
    </div>
  );
}
