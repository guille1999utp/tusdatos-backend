import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IRoles } from '@/models/app/roles/roles.model';
import type { IGetRolesResp } from '@/models/app/roles/get-all/get-all-roles.model';
import { getAllRoles } from './roles.thunks';

interface IProps {
  listRoles: IRoles[];
  isLoadingGetRoles: boolean;
  isLoadingInsertRoles: boolean;
  isLoadingDeleteRoles: boolean;
  isLoadingImportFileRoles: boolean;
}

const initialState: IProps = {
  listRoles: [],
  isLoadingGetRoles: false,
  isLoadingInsertRoles: false,
  isLoadingDeleteRoles: false,
  isLoadingImportFileRoles: false,
};

export const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // GET ALL INVOICES
      .addCase(getAllRoles.pending, state => {
        state.isLoadingGetRoles = true;
      })
      .addCase(getAllRoles.fulfilled, (state, action: PayloadAction<IGetRolesResp>) => {
        state.listRoles = action.payload;
        state.isLoadingGetRoles = false;
      })
      .addCase(getAllRoles.rejected, state => {
        state.isLoadingGetRoles = false;
      })
  },
});

export default rolesSlice;
