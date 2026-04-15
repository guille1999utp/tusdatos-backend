import type { IInsertEventsReq, IUpdateEventsReq } from "@/models/app/events/insert/insert-events.model";
import EventsService from "@/services/app/events/events.service";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface IPayload {
    filters?: { [key: string]: string };
}

export interface IPayloadInsertEvents {
    params: IInsertEventsReq;
    errorCallback: (msg: string) => void;
}

export interface IPayloadUpdateEvents {
    params: IUpdateEventsReq;
    errorCallback: (msg: string) => void;
}

export interface SuscribeEvents {
    params: {
        id: number;
    };
    errorCallback: (msg: string) => void;
}

export interface RegisterEvents {
  params: {
      id: number;
      user_id: number;
      role: "usuario" | "asistente";
  };
  errorCallback: (msg: string) => void;
}

export const getAllEvents = createAsyncThunk(
    "events/get-all",
    async (payload: IPayload, thunkAPI) => {
        try {
            const resp = await EventsService.getAll(payload.filters);
            return resp;
        } catch {
            return thunkAPI.rejectWithValue(null);
        }
    }
);

export const getMyEvents = createAsyncThunk(
    "events/get-my-events",
    async (payload: IPayload, thunkAPI) => {
        try {
            const resp = await EventsService.getMine(payload.filters);
            return resp;
        } catch {
            return thunkAPI.rejectWithValue(null);
        }
    }
);

export const insertEvents = createAsyncThunk(
    "events/insert",
    async (payload: IPayloadInsertEvents, thunkAPI) => {
        try {
            const resp = await EventsService.insert(
                payload.params,
                payload.errorCallback
            );

            return resp;
        } catch {
            return thunkAPI.rejectWithValue({
                ok: false,
                msg: "Hubo un error al crear el evento",
            });
        }
    }
);

export const updateEvents = createAsyncThunk(
    "events/update",
    async (payload: IPayloadUpdateEvents, thunkAPI) => {
        try {
            const resp = await EventsService.update(
                payload.params,
                payload.errorCallback
            );

            return resp;
        } catch {
            return thunkAPI.rejectWithValue({
                ok: false,
                msg: "Hubo un error al actualizar el evento",
            });
        }
    }
);

export const suscribeEvents = createAsyncThunk(
    "events/suscribe",
    async (payload: SuscribeEvents, thunkAPI) => {
        try {
            const resp = await EventsService.subscribe(
                payload.params,
                payload.errorCallback
            );

            return resp;
        } catch {
            return thunkAPI.rejectWithValue({
                ok: false,
                msg: "Hubo un error al registrarse al evento",
            });
        }
    }
);

export const registerEventUser = createAsyncThunk(
    "events/register-user",
    async (payload: RegisterEvents, thunkAPI) => {
        try {
            const resp = await EventsService.registerUser(
                payload.params,
                payload.errorCallback
            );

            return resp;
        } catch (e: unknown) {
            const msg =
                e &&
                typeof e === "object" &&
                "message" in e &&
                typeof (e as { message: unknown }).message === "string"
                    ? (e as { message: string }).message.trim()
                    : "";
            return thunkAPI.rejectWithValue({
                ok: false,
                msg: msg || "Hubo un error al asignar usuario al evento",
            });
        }
    }
);

export const deleteEvents = createAsyncThunk(
    "workshops/delete",
    async (payload: any, thunkAPI) => {
        try {
            const resp = await EventsService.delete(payload.params);
            // const resp = true

            return resp;
        } catch {
            return thunkAPI.rejectWithValue(null);
        }
    }
);

// export const cancelRequestEvents = createAsyncThunk(
//   'vehicle-programming-scenario/cancel-request',
//   async () => {
//     EventsService.cancelRequest();
//   }
// );
