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

  isDraft: boolean;
  lastSavedAt: number | null;
  validationErrors: Record<string, string>;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBooking: (data: Partial<BookingState>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationErrors: () => void;
  saveDraft: () => void;
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
  isDraft: false,
  lastSavedAt: null,
  validationErrors: {},
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      updateBooking: (data) => set((state) => ({ ...state, ...data, isDraft: true, lastSavedAt: Date.now() })),
      setValidationError: (field, error) => set((state) => ({ validationErrors: { ...state.validationErrors, [field]: error } })),
      clearValidationErrors: () => set({ validationErrors: {} }),
      saveDraft: () => set({ isDraft: true, lastSavedAt: Date.now() }),
      resetBooking: () => set(initialState),
    }),
    {
      name: 'sharpwork-booking-storage',
    }
  )
);
