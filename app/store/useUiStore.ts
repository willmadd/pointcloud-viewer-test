import { create } from "zustand";

type Loader = {
  message: string;
  percentage: number;
} | null;

interface UiStore {
  loader: Loader;

  setLoading: (loader: Loader) => void;
  setLoadingMessage: (message: string) => void;
  setLoadingPercentage: (percentage: number) => void;
  clearLoading: () => void;

  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  loader: null,

  setLoading: (loader) => set({ loader }),

  setLoadingMessage: (message) =>
    set((state) => ({
      loader: {
        message,
        percentage: state.loader?.percentage ?? 0,
      },
    })),

  setLoadingPercentage: (percentage) =>
    set((state) => ({
      loader: {
        message: state.loader?.message ?? "",
        percentage,
      },
    })),

  clearLoading: () => set({ loader: null }),

  debugMode: false,
  setDebugMode: (debug) => set({ debugMode: debug }),
}));
