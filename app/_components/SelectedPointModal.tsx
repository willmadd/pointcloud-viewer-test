import React from "react";
import { useUiStore } from "../store/useUiStore";

const SelectedPointModal = () => {
  const selectedPoint = useUiStore((state) => state.selectedPoint);
  const setSelectedPoint = useUiStore((state) => state.setSelectedPoint);

  if (!selectedPoint) return null;

  return (
    <div className="absolute left-5 top-5 z-50">
      <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Selected Point</h3>

          <button
            onClick={() => setSelectedPoint(null)}
            className="text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="mb-1 text-zinc-500">Position</div>

            <div className="rounded-md bg-zinc-900 p-2 font-mono text-zinc-300">
              X: {selectedPoint.position.x.toFixed(3)}
              <br />
              Y: {selectedPoint.position.y.toFixed(3)}
              <br />
              Z: {selectedPoint.position.z.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Colour</div>

            <div className="flex items-center gap-2 rounded-md bg-zinc-900 p-2">
              <div
                className="h-4 w-4 rounded border border-zinc-700"
                style={{
                  backgroundColor: `rgb(
                    ${selectedPoint.color.x * 255},
                    ${selectedPoint.color.y * 255},
                    ${selectedPoint.color.z * 255}
                  )`,
                }}
              />

              <span className="font-mono text-zinc-300">
                {selectedPoint.color.x.toFixed(2)},{" "}
                {selectedPoint.color.y.toFixed(2)},{" "}
                {selectedPoint.color.z.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedPointModal;
