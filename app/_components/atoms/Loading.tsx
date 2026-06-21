import { useUiStore } from "@/app/store/useUiStore";

const LoadingSpinner = () => {
  const loader = useUiStore((state) => state.loader);

  if (!loader) return null;

  return (
    <div className="absolute left-5 top-5 z-50">
      <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
        <div className="mb-0 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-300">
              {loader.message}
            </div>
          </div>

          <div className="text-xs tabular-nums text-zinc-500">
            {Math.round(loader.percentage)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
