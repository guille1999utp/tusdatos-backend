import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hooks";
import {
  insertEvents,
  updateEvents,
} from "@/redux/features/events/events.thunks";
import { toast } from "react-toastify";
import type { IEvents } from "@/models/app/events/events.model";
import type { IUpdateEventsReq } from "@/models/app/events/insert/insert-events.model";
import { Button } from "@/components/ui/button";

type EventFormInputs = {
  title: string;
  description: string;
  date: string;
  capacity: number;
  state: "scheduled" | "ongoing" | "completed" | "cancelled";
};

const schema = Yup.object({
  title: Yup.string().required("El título es requerido"),
  description: Yup.string().required("La descripción es requerida"),
  date: Yup.string().required("La fecha es requerida"),
  capacity: Yup.number()
    .min(1, "Debe ser mayor que 0")
    .required("La capacidad es requerida"),
  state: Yup.string()
    .oneOf(
      ["scheduled", "ongoing", "completed", "cancelled"],
      "Estado inválido",
    )
    .required("El estado es requerido"),
});

interface IProps {
  onMounted: () => Promise<void>;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentEventsState: IEvents | null | undefined;
}

const defaultValues: EventFormInputs = {
  title: "",
  description: "",
  date: "",
  capacity: 0,
  state: "scheduled",
};

export const FormEvents = ({
  onMounted,
  closeModal,
  currentEventsState,
}: IProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: currentEventsState
      ? { ...currentEventsState }
      : defaultValues,
  });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: EventFormInputs) => {
    let res;

    if (currentEventsState) {
      const updatePayload: IUpdateEventsReq = {
        id: currentEventsState.id,
        ...data,
      };
      res = await dispatch(
        updateEvents({
          params: updatePayload,
          errorCallback: (msg: string) =>
            toast.error(msg, { position: "top-right" }),
        }),
      );
    } else {
      res = await dispatch(
        insertEvents({
          params: data,
          errorCallback: (msg: string) =>
            toast.error(msg, { position: "top-right" }),
        }),
      );
    }

    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success(
        currentEventsState
          ? "Evento actualizado con éxito"
          : "Evento creado con éxito",
      );
      onMounted();
      closeModal(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full h-full tracking-tight "
    >
      <h3 className="md:text-xl font-semibold">
        {currentEventsState ? "Actualizar evento" : "Crear evento"}
      </h3>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="capacity">Capacidad</Label>
        <Input id="capacity" type="number" {...register("capacity")} />
        {errors.capacity && (
          <p className="text-sm text-red-500">{errors.capacity.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="state">Estado</Label>
        <select
          id="state"
          {...register("state")}
          className="bg-black border border-slate-700 rounded-md p-2 text-slate-100"
        >
          <option value="">Seleccionar estado</option>
          <option value="scheduled">Programado</option>
          <option value="ongoing">En curso</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {errors.state && (
          <p className="text-sm text-red-500">{errors.state.message}</p>
        )}
      </div>

      <Button
        variant={"main"}
        type="submit"
        className={cn("mt-2 h-12 font-semibold")}
      >
        {currentEventsState ? "Actualizar evento" : "Crear evento"}
      </Button>
    </form>
  );
};
