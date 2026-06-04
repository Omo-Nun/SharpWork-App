import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingState {
  step: number;
  artisanId: string | null;
  categorySlugs: string[];
  serviceDetails: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  location: {
    address: string;
    lat: number | null;
    lng: number | null;
  };
  priceEstimate: number | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBooking: (data: Partial<BookingState>) => void;
  resetBooking: () => void;
}

const initialState = {
  step: 1,
  artisanId: null,
  categorySlugs: [] as string[],
  serviceDetails: '',
  scheduledDate: null,
  scheduledTime: null,
  location: { address: '', lat: null, lng: null },
  priceEstimate: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      updateBooking: (data) => set((state) => ({ ...state, ...data })),
      resetBooking: () => set(initialState),
    }),
    {
      name: 'sharpwork-booking-storage',
    }
  )
);
