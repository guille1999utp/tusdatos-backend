import { useCallback, useEffect, useMemo, useState } from "react";
import { AuroraText } from "@/components/magicui/aurora-text";
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
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";

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

  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const saveRole = async (userId: number) => {
    const role = draftRoles[userId];
    if (!role) return;
    try {
      const resp = await UsersService.updateRole(userId, role, (msg) => {
        toast.error(msg || "No se pudo actualizar el rol");
      });
      toast.success("Rol actualizado");
      if (resp.logout_required) {
        toast.info(
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

  const removeUser = async (userId: number, label: string) => {
    if (
      !window.confirm(
        `¿Eliminar por completo al usuario «${label}»? Se borrarán sus eventos e inscripciones.`,
      )
    ) {
      return;
    }
    try {
      await UsersService.deleteUser(userId, (msg) => {
        toast.error(msg || "No se pudo eliminar el usuario");
      });
      toast.success("Usuario eliminado");
      await load();
    } catch {
      /* 400: el detalle ya se mostró en errorCallback */
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold md:text-5xl">
        <AuroraText>Admin · Usuarios</AuroraText>
      </h1>
      <p className="text-muted-foreground text-sm max-w-2xl">
        Busca usuarios por nombre o correo y asigna el rol global (admin o
        usuario). Debe existir siempre al menos un administrador. Si dejas de
        ser admin, la sesión se cerrará automáticamente.
      </p>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-md space-y-1">
          <label className="text-sm text-muted-foreground">Buscador</label>
          <Input
            placeholder="Nombre o email…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
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
      </div>
      <Separator />
      {loading ? <p className="text-muted-foreground">Cargando…</p> : null}

      <div className="rounded-md border overflow-x-auto">
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
                  <select
                    className="flex h-9 w-[180px] rounded-md border border-input bg-background px-2 text-sm"
                    value={draftRoles[u.id] ?? u.role}
                    onChange={(e) =>
                      setDraftRoles((prev) => ({
                        ...prev,
                        [u.id]: e.target.value,
                      }))
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
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
      </div>
    </div>
  );
}
