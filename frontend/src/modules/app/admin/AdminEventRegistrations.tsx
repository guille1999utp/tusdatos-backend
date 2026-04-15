import { EventParticipantsList } from "@/modules/app/events/components/EventParticipantsList";

type Props = {
  eventId: number;
  onEventsListRefresh: () => Promise<void>;
};

export function AdminEventRegistrations({ eventId, onEventsListRefresh }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl w-full">
      <h3 className="text-lg font-semibold">Personas del evento</h3>
      <EventParticipantsList eventId={eventId} roleEditMode="full" onChanged={onEventsListRefresh} />
    </div>
  );
}
