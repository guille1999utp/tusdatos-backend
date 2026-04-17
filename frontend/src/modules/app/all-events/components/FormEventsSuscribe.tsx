import { Button } from "@/components/ui/button";
import { suscribeEvents } from "@/redux/features/events/events.thunks";
import { useAppDispatch } from "@/redux/hooks";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import type { IEvents } from "@/models/app/events/events.model";
import EventsService from "@/services/app/events/events.service";
import { useAuth } from "@/hooks/useAuth";
// import { useNavigate } from "react-router-dom";
import TransitionLink from "@/providers/TransitionLink";

function isEnrolled(role: string | null | undefined) {
  return role === "usuario" || role === "asistente";
}

export const FormEventsSuscribe = ({
  event,
  setOpenModal,
  onMounted,
}: {
  event: IEvents | null;
  setOpenModal: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      event: IEvents | null;
    }>
  >;
  onMounted: () => Promise<void>;
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setFeedback(null);
  }, [event?.id]);

  const handleSubscribe = async () => {
    if (event == null) return;
    setFeedback(null);
    const respDispatch = await dispatch(
      suscribeEvents({
        params: { id: event.id },
        errorCallback: (msg) => {
          setFeedback(msg);
        },
      }),
    );
    if (respDispatch.meta.requestStatus === "fulfilled") {
      toast.success("Te has registrado en el evento");
      setOpenModal({ open: false, event: null });
      await onMounted();
    }
  };

  const handleLeave = async () => {
    if (event == null) return;
    setFeedback(null);
    setLeaving(true);
    try {
      await EventsService.leaveEventSelf(event.id);
      toast.success("Has abandonado el evento");
      setOpenModal({ open: false, event: null });
      await onMounted();
    } catch {
      toast.error("No se pudo abandonar el evento");
    } finally {
      setLeaving(false);
    }
  };

  if (event == null) {
    return null;
  }

  const organizer = event.role === "organizador";
  const enrolled = isEnrolled(event.role);

  return (
    <div className="flex flex-col gap-3 p-1">
      <p className="text-sm font-medium text-foreground">{event.title}</p>
      {feedback ? (
        <p className="text-sm text-destructive font-medium" role="alert">
          {feedback}
        </p>
      ) : null}
      {organizer ? (
        <p className="text-sm text-muted-foreground">
          Eres el organizador de este evento; no necesitas inscribirte como
          participante.
        </p>
      ) : enrolled ? (
        <Button
          type="button"
          variant="outline"
          className="border-destructive/60 text-destructive hover:bg-destructive/10"
          disabled={leaving}
          onClick={() => void handleLeave()}
        >
          {leaving ? "Procesando…" : "Dejar evento"}
        </Button>
      ) : !user ? (
        <TransitionLink
          to={`/login?redirect=${encodeURIComponent(`/?eventId=${event.id}`)}`}
        >
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
            Inscribirme
          </Button>
        </TransitionLink>
      ) : (
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => void handleSubscribe()}
        >
          Inscribirme
        </Button>
      )}
    </div>
  );
};
