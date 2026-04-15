import { clientHTTP } from "@/api/configAxios";
import type { IDeleteEventsReq, IDeleteEventsResp } from "@/models/app/events/delete/delete-events.model";
import type { IGetEventsResp } from "@/models/app/events/get-all/get-all-events.model";
import type { IEvents } from "@/models/app/events/events.model";
import type { IPaginatedEventParticipants } from "@/models/app/events/event-participants.model";
import type { IInsertEventsReq, IInsertEventsResp, IUpdateEventsReq } from "@/models/app/events/insert/insert-events.model";
import { handleApiErrors } from "@/services/utilities/handle-api-error.utility";
import { transformToQueryString } from "@/services/utilities/transformToQueryString";



interface IFilters {
    [key: string]: string;
}

export default class EventsService {

    public static async getAll(filters?: IFilters): Promise<IGetEventsResp> {
        return handleApiErrors<IGetEventsResp>(() =>
            clientHTTP.get<IGetEventsResp>(
                filters ? transformToQueryString("event", filters) : "event"
            )
        )
    }

    public static async getMine(filters?: IFilters): Promise<IGetEventsResp> {
        return handleApiErrors<IGetEventsResp>(() =>
            clientHTTP.get<IGetEventsResp>(
                filters ? transformToQueryString("event/my-events", filters) : "event/my-events"
            )
        )
    }

    public static async getAssistant(filters?: IFilters): Promise<IGetEventsResp> {
        return handleApiErrors<IGetEventsResp>(() =>
            clientHTTP.get<IGetEventsResp>(
                filters
                    ? transformToQueryString("event/my-assistant-events", filters)
                    : "event/my-assistant-events"
            )
        )
    }

    public static async getById(id: number): Promise<IEvents> {
        return handleApiErrors<IEvents>(() => clientHTTP.get<IEvents>(`event/${id}`));
    }

    public static async getMyRegistrations(filters?: IFilters): Promise<IEvents[]> {
        return handleApiErrors<IEvents[]>(() =>
            clientHTTP.get<IEvents[]>(
                filters ? transformToQueryString("event/my-events-registers", filters) : "event/my-events-registers"
            )
        )
    }

    public static async insert(
        obj: IInsertEventsReq,
        errorCallback: (msg: string) => void
      ): Promise<IInsertEventsResp> {
        return await handleApiErrors<IInsertEventsResp>(
          () =>
            clientHTTP.post<IInsertEventsResp>('event', obj),
          errorCallback
        );
      }

      public static async update(
        obj: IUpdateEventsReq,
        errorCallback: (msg: string) => void
      ): Promise<IInsertEventsResp> {
        return await handleApiErrors<IInsertEventsResp>(
          () =>
            clientHTTP.put<IInsertEventsResp>(`event/${obj.id}`, obj),
          errorCallback
        );
      }

      public static async delete(obj: IDeleteEventsReq): Promise<IDeleteEventsResp> {
        return await handleApiErrors<IDeleteEventsResp>(() =>
          clientHTTP.delete<IDeleteEventsResp>(`event/${obj.id}`)
        );
      }

      public static async subscribe(
        obj: { id: number },
        errorCallback: (msg: string) => void
      ): Promise<IInsertEventsResp> {
        return await handleApiErrors<IInsertEventsResp>(
          () =>
            clientHTTP.post<IInsertEventsResp>(`event/${obj.id}`, obj),
          errorCallback
        );
      }

      public static async registerUser(
        obj: { id: number; user_id: number; role: "usuario" | "asistente" },
        errorCallback: (msg: string) => void
      ): Promise<IInsertEventsResp> {
        return await handleApiErrors<IInsertEventsResp>(
          () =>
            clientHTTP.post<IInsertEventsResp>(
              `event/${Number(obj.id)}/register/${obj.user_id}`,
              { role: obj.role }
            ),
          errorCallback
        );
      }

      public static async searchEventUsers(
        eventId: number,
        filters: { q?: string; skip?: string; limit?: string; omit_event_members?: string }
      ): Promise<{ items: { id: number; name: string; email: string; role: string }[]; total: number }> {
        return handleApiErrors(() =>
          clientHTTP.get(
            transformToQueryString(`event/${eventId}/users/search`, filters as Record<string, string>)
          )
        );
      }

      public static async listEventRegistrations(
        eventId: number,
        filters: { q?: string; skip?: string; limit?: string }
      ): Promise<IPaginatedEventParticipants> {
        return handleApiErrors(() =>
          clientHTTP.get(
            transformToQueryString(`event/${eventId}/registrations`, filters as Record<string, string>)
          )
        );
      }

      public static async removeEventRegistration(eventId: number, userId: number): Promise<{ msg: string }> {
        return handleApiErrors(() =>
          clientHTTP.delete(`event/${eventId}/register/${userId}`)
        );
      }

      /** El usuario autenticado deja su inscripción en el evento (participante o asistente). */
      public static async leaveEventSelf(eventId: number): Promise<{ msg: string }> {
        return handleApiErrors(() => clientHTTP.delete(`event/${eventId}/register/me`));
      }

      public static async updateEventRegistrationRole(
        eventId: number,
        userId: number,
        role: "usuario" | "asistente",
        errorCallback: (msg: string) => void
      ): Promise<{ user_id: number; event_id: number; role: string }> {
        return handleApiErrors(
          () => clientHTTP.put(`event/${eventId}/register/${userId}`, { role }),
          errorCallback
        );
      }

      public static async transferOrganizer(
        eventId: number,
        userId: number
      ): Promise<{ msg: string; created_by: number }> {
        return handleApiErrors<{ msg: string; created_by: number }>(() =>
          clientHTTP.put(`event/${eventId}/organizer`, { user_id: userId })
        );
      }

}
