import { create } from "zustand";

interface UiStore {
  isLoading: null | string;
  setLoading: (loading: null | string) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isLoading: null,
  setLoading: (loading) => set({ isLoading: loading }),
  debugMode: false,
  setDebugMode: (debug) => set({ debugMode: debug }),
}));
