import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUsers } from '@/models/app/users/users.model';
import type { IGetUsersResp } from '@/models/app/users/get-all/get-all-users.model';
import { getAllUsers } from './users.thunks';

interface IProps {
  listUsers: IUsers[];
  isLoadingGetUsers: boolean;
  isLoadingInsertUsers: boolean;
  isLoadingDeleteUsers: boolean;
  isLoadingImportFileUsers: boolean;
}

const initialState: IProps = {
  listUsers: [],
  isLoadingGetUsers: false,
  isLoadingInsertUsers: false,
  isLoadingDeleteUsers: false,
  isLoadingImportFileUsers: false,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // GET ALL INVOICES
      .addCase(getAllUsers.pending, state => {
        state.isLoadingGetUsers = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action: PayloadAction<IGetUsersResp>) => {
        state.listUsers = action.payload;
        state.isLoadingGetUsers = false;
      })
      .addCase(getAllUsers.rejected, state => {
        state.isLoadingGetUsers = false;
      })
  },
});

export default usersSlice;
