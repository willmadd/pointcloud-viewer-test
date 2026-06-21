import { Vector3 } from "three";
import { create } from "zustand";

/**
 * Zustand store used to store various UI Aspects, e.g. weather app is loading or in debug mode
 */

type Loader = {
  message: string;
  percentage: number;
} | null;

type SelectedPoint = {
  index: number;
  position: Vector3;
  color: Vector3;
};

interface UiStore {
  loader: Loader;

  setLoading: (loader: Loader) => void;
  setLoadingMessage: (message: string) => void;
  setLoadingPercentage: (percentage: number) => void;
  clearLoading: () => void;

  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  selectedPoint: null | SelectedPoint;
  setSelectedPoint: (selectedPoint: SelectedPoint | null) => void;
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
  selectedPoint: null,
  setSelectedPoint: (selectedPoint) =>
    set({
      selectedPoint,
    }),
}));
