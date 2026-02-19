import { configureStore, createSlice } from '@reduxjs/toolkit';

// Simple dummy slice for the hackathon
const visitSlice = createSlice({
  name: 'visits',
  initialState: { checkedIn: false },
  reducers: {
    checkIn: (state) => { state.checkedIn = true; },
  },
});

export const store = configureStore({
  reducer: {
    visits: visitSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;