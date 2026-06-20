const LoadingSpinner = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center justify-center absolute z-50  top-5 left-5">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

        {label && (
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
