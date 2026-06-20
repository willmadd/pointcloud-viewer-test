import { create } from "zustand";

interface UiStore {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  debugMode: false,
  setDebugMode: (debug) => set({ debugMode: debug }),
}));
