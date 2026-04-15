
import RolesService from "@/services/app/roles/roles.service";
import { createAsyncThunk } from "@reduxjs/toolkit";


interface IPayload {
    filters?: { [key: string]: string };
}

export interface SuscribeRoles {
    params: {
      id: number;
    };
    errorCallback: (msg: string) => void;
  }
  

export const getAllRoles = createAsyncThunk(
    "roles/get-all",
    async (payload : IPayload, thunkAPI) => {
        try {
            const resp = await RolesService.getAll(payload.filters);
            return resp;
        } catch {
            return thunkAPI.rejectWithValue(null);
        }
    }
);

