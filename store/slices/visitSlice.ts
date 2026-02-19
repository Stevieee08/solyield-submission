import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { scheduledVisits } from '../../constants/schedule';
import { sites } from '../../constants/sites';

export interface Visit {
  id: string;
  siteId: string;
  siteName: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'in-progress';
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  latitude: number;
  longitude: number;
  technician: string;
  notes: string;
}

interface VisitState {
  visits: Visit[];
  loading: boolean;
  error: string | null;
}

const initialState: VisitState = {
  visits: scheduledVisits.map(visit => {
    const site = sites.find(s => s.id === visit.siteId);
    return {
      ...visit,
      status: 'pending' as const,
      isCheckedIn: false,
      latitude: site?.latitude || 0,
      longitude: site?.longitude || 0,
    };
  }),
  loading: false,
  error: null,
};

const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    updateVisit: (state, action: PayloadAction<Partial<Visit> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      const visitIndex = state.visits.findIndex(visit => visit.id === id);
      
      if (visitIndex !== -1) {
        state.visits[visitIndex] = {
          ...state.visits[visitIndex],
          ...updates,
        };
      }
    },
    setVisitStatus: (state, action: PayloadAction<{ id: string; status: Visit['status'] }>) => {
      const { id, status } = action.payload;
      const visit = state.visits.find(v => v.id === id);
      
      if (visit) {
        visit.status = status;
      }
    },
    checkInVisit: (state, action: PayloadAction<{ id: string; checkInTime: string }>) => {
      const { id, checkInTime } = action.payload;
      const visit = state.visits.find(v => v.id === id);
      
      if (visit) {
        visit.isCheckedIn = true;
        visit.checkInTime = checkInTime;
        visit.status = 'in-progress';
      }
    },
    checkOutVisit: (state, action: PayloadAction<{ id: string; checkOutTime: string }>) => {
      const { id, checkOutTime } = action.payload;
      const visit = state.visits.find(v => v.id === id);
      
      if (visit) {
        visit.isCheckedIn = false;
        visit.checkOutTime = checkOutTime;
        visit.status = 'completed';
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  updateVisit,
  setVisitStatus,
  checkInVisit,
  checkOutVisit,
  setLoading,
  setError,
} = visitSlice.actions;

export default visitSlice.reducer;
