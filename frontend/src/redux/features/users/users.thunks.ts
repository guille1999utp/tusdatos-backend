
import UsersService from "@/services/app/users/users.service";
import { createAsyncThunk } from "@reduxjs/toolkit";


interface IPayload {
    filters?: { [key: string]: string };
}

export interface SuscribeUsers {
    params: {
      id: number;
    };
    errorCallback: (msg: string) => void;
  }
  

export const getAllUsers = createAsyncThunk(
    "users/get-all",
    async (payload : IPayload, thunkAPI) => {
        try {
            const resp = await UsersService.getAll(payload.filters);
            return resp;
        } catch {
            return thunkAPI.rejectWithValue(null);
        }
    }
);

// export const cancelRequestUsers = createAsyncThunk(
//   'vehicle-programming-scenario/cancel-request',
//   async () => {
//     UsersService.cancelRequest();
//   }
// );

