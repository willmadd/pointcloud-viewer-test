"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 max-w-md">
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4 shadow-lg">
        <div className="flex-1">
          <h2 className="font-medium text-neutral-900">Error</h2>

          <p className="mt-1 text-sm text-neutral-600">{error.message}</p>

          <button
            onClick={reset}
            className="mt-3 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
          >
            Try again
          </button>
        </div>

        <button
          onClick={reset}
          className="text-neutral-400 hover:text-neutral-600"
        ></button>
      </div>
    </div>
  );
}
