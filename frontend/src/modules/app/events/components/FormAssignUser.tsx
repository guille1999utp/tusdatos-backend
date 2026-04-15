import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "react-toastify";
import { useDebounce } from "@/lib/useDebounce";
import { useEffect, useState, useCallback, useMemo } from "react";

import { SingleSelectCombobox } from "@/components/common/molecules/select-combobox/SingleSelectCombobox";
import { registerEventUser } from "@/redux/features/events/events.thunks";
import EventsService from "@/services/app/events/events.service";
import { getFastApiErrorMessage } from "@/services/utilities/handle-api-error.utility";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventParticipantsList } from "@/modules/app/events/components/EventParticipantsList";

type EventFormInputs = {
  user_id: number;
  role: "usuario" | "asistente" | "organizador";
};

interface IProps {
  idEvent: number;
  onMounted: () => Promise<void>;
  closeModal: () => void;
  /** Si el staff es solo asistente del evento, solo puede añadir participantes con rol usuario. */
  soloParticipantes: boolean;
}

const defaultValues: EventFormInputs = {
  user_id: 0,
  role: "usuario",
};

const USER_PAGE = 8;

export const FormAssignUser = ({ onMounted, closeModal, idEvent, soloParticipantes }: IProps) => {
  const schema = useMemo(
    () =>
      Yup.object({
        user_id: Yup.number().min(1, "Debes seleccionar un usuario").required(),
        role: soloParticipantes
          ? Yup.mixed<"usuario">().oneOf(["usuario"] as const).required()
          : Yup.mixed<"usuario" | "asistente" | "organizador">()
              .oneOf(["usuario", "asistente", "organizador"] as const)
              .required("Selecciona un rol"),
      }),
    [soloParticipantes]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormInputs>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const dispatch = useAppDispatch();
  const roleWatch = watch("role");
  const [userQuery, setUserQuery] = useState("");
  const debouncedQuery = useDebounce(userQuery, 350);
  const [userPage, setUserPage] = useState(0);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [participantsVersion, setParticipantsVersion] = useState(0);

  /** Con rol «organizador» el listado incluye inscritos (para traspaso); en usuario/asistente solo quienes no están en el evento. */
  const omitEventMembers =
    soloParticipantes || roleWatch === "usuario" || roleWatch === "asistente";

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const resp = await EventsService.searchEventUsers(idEvent, {
        q: debouncedQuery,
        skip: String(userPage * USER_PAGE),
        limit: String(USER_PAGE),
        omit_event_members: omitEventMembers ? "true" : "false",
      });
      setUserOptions(
        resp.items.map((u) => ({
          label: `${u.name} (${u.email})`,
          value: u.id,
        }))
      );
      setUserTotal(resp.total);
    } catch {
      toast.error("No se pudo cargar el listado de usuarios");
    } finally {
      setLoadingUsers(false);
    }
  }, [idEvent, debouncedQuery, userPage, omitEventMembers]);

  const refreshParentTableAndUserPicker = useCallback(async () => {
    await onMounted();
    await loadUsers();
  }, [onMounted, loadUsers]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setUserPage(0);
  }, [debouncedQuery, idEvent, omitEventMembers]);

  useEffect(() => {
    if (soloParticipantes) {
      setValue("role", "usuario");
    }
  }, [soloParticipantes, setValue]);

  useEffect(() => {
    setValue("user_id", 0);
  }, [roleWatch, setValue]);

  const onSubmit = async (data: EventFormInputs) => {
    const { user_id, role } = data;

    if (!soloParticipantes && role === "organizador") {
      try {
        await EventsService.transferOrganizer(idEvent, user_id);
        toast.success("Titular del evento actualizado");
        setParticipantsVersion((v) => v + 1);
        await refreshParentTableAndUserPicker();
        setValue("user_id", 0);
        setValue("role", "usuario");
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data
            ? getFastApiErrorMessage(err.response.data)
            : "";
        toast.error(msg || "No se pudo trasladar la organización");
      }
      return;
    }

    const apiRole: "usuario" | "asistente" = role === "asistente" ? "asistente" : "usuario";

    const res = await dispatch(
      registerEventUser({
        params: { id: idEvent, user_id, role: apiRole },
        errorCallback: (msg) => {
          toast.error(msg?.trim() || "Error al asignar el usuario o ya está asignado");
        },
      })
    );

    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Usuario asignado o rol actualizado");
      setParticipantsVersion((v) => v + 1);
      await refreshParentTableAndUserPicker();
      setValue("user_id", 0);
      setValue("role", "usuario");
    }
  };

  const roleOptions = soloParticipantes
    ? [{ label: "Participante (usuario)", value: 0 as const }]
    : [
        { label: "Participante (usuario)", value: 0 as const },
        { label: "Asistente del evento", value: 1 as const },
        { label: "Organizador (titular del evento)", value: 2 as const },
      ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full h-full p-4 tracking-tight text-slate-100/80"
    >
      <h3 className="text-lg font-bold text-slate-800/50 dark:text-slate-200">
        Asignar usuario al evento
      </h3>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Buscar por nombre o correo</label>
        <Input
          placeholder="Escribe para buscar…"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
      </div>

      <Controller
        name="user_id"
        control={control}
        render={({ field }) => (
          <SingleSelectCombobox
            options={userOptions}
            value={field.value > 0 ? field.value : undefined}
            onChange={(val) => field.onChange(Number(val))}
            error={errors.user_id?.message}
            placeholder="Selecciona un usuario…"
            loading={loadingUsers}
          />
        )}
      />

      {userTotal > USER_PAGE ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={userPage === 0}
            onClick={() => setUserPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {userPage + 1} · {userTotal} usuarios
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(userPage + 1) * USER_PAGE >= userTotal}
            onClick={() => setUserPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      ) : null}

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <SingleSelectCombobox
            options={roleOptions.map((o, i) => ({
              label: o.label,
              value: i,
            }))}
            value={field.value === "organizador" ? 2 : field.value === "asistente" ? 1 : 0}
            onChange={(val) => {
              const n = Number(val);
              field.onChange(n === 2 ? "organizador" : n === 1 ? "asistente" : "usuario");
            }}
            error={errors.role?.message}
            placeholder="Rol en el evento…"
            loading={false}
          />
        )}
      />

      {soloParticipantes ? (
        <p className="text-xs text-muted-foreground">
          Como asistente puedes dar de alta participantes (usuario) o promoverlos a asistente si ya estaban inscritos.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          «Organizador» traslada la titularidad del evento al usuario elegido (el organizador anterior pasa a participante
          si no tenía inscripción).
        </p>
      )}

      <EventParticipantsList
        eventId={idEvent}
        roleEditMode={soloParticipantes ? "promote-only" : "full"}
        refreshVersion={participantsVersion}
        onChanged={refreshParentTableAndUserPicker}
      />

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className={cn(
            "mt-2 h-10 w-full rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold"
          )}
        >
          Asignar o actualizar rol
        </button>
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => closeModal()}>
          Cerrar
        </Button>
      </div>
    </form>
  );
};
