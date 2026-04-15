import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IEvents } from '@/models/app/events/events.model';
import type { IGetEventsResp } from '@/models/app/events/get-all/get-all-events.model';
import { deleteEvents, getAllEvents, getMyEvents, insertEvents } from './events.thunks';

interface IProps {
  listEvents: IEvents[];
  listMyEvents: IEvents[];
  totalListEvents: number;
  totalMyEvents: number;
  isLoadingGetEvents: boolean;
  isLoadingInsertEvents: boolean;
  isLoadingDeleteEvents: boolean;
  isLoadingImportFileEvents: boolean;
}

const initialState: IProps = {
  listEvents: [],
  listMyEvents: [],
  totalListEvents: 0,
  totalMyEvents: 0,
  isLoadingGetEvents: false,
  isLoadingInsertEvents: false,
  isLoadingDeleteEvents: false,
  isLoadingImportFileEvents: false,
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // GET ALL INVOICES
      .addCase(getAllEvents.pending, state => {
        state.isLoadingGetEvents = true;
      })
      .addCase(getAllEvents.fulfilled, (state, action: PayloadAction<IGetEventsResp>) => {
        state.listEvents = action.payload.items;
        state.totalListEvents = action.payload.total;
        state.isLoadingGetEvents = false;
      })
      .addCase(getAllEvents.rejected, state => {
        state.isLoadingGetEvents = false;
      })

      .addCase(getMyEvents.pending, state => {
        state.isLoadingGetEvents = true;
      })
      .addCase(getMyEvents.fulfilled, (state, action: PayloadAction<IGetEventsResp>) => {
        state.listMyEvents = action.payload.items;
        state.totalMyEvents = action.payload.total;
        state.isLoadingGetEvents = false;
      })
      .addCase(getMyEvents.rejected, state => {
        state.isLoadingGetEvents = false;
      })

      // INSERT INVOICES
      .addCase(insertEvents.pending, state => {
        state.isLoadingInsertEvents = true;
      })
      .addCase(insertEvents.fulfilled, state => {
        state.isLoadingInsertEvents = false;
      })
      .addCase(insertEvents.rejected, state => {
        state.isLoadingInsertEvents = false;
      })

      // INSERT INVOICES
      .addCase(deleteEvents.pending, state => {
        state.isLoadingDeleteEvents = true;
      })
      .addCase(deleteEvents.fulfilled, state => {
        state.isLoadingDeleteEvents = false;
      })
      .addCase(deleteEvents.rejected, state => {
        state.isLoadingDeleteEvents = false;
      });
  },
});

export default eventsSlice;
