// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import eventsSlice from './features/events/events.slice';
import usersSlice from './features/users/users.slice';
import rolesSlice from './features/roles/roles.slice';


export const store = configureStore({
  reducer: {
    events: eventsSlice.reducer,
    users: usersSlice.reducer,
    roles: rolesSlice.reducer,
  },
});

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
