import { EventParticipantsList } from "@/modules/app/events/components/EventParticipantsList";

type Props = {
  eventId: number;
  onEventsListRefresh: () => Promise<void>;
};

export function AdminEventRegistrations({
  eventId,
  onEventsListRefresh,
}: Props) {
  return (
    <div className="flex flex-col gap-4  w-full">
      <EventParticipantsList
        eventId={eventId}
        roleEditMode="full"
        onChanged={onEventsListRefresh}
      />
    </div>
  );
}
