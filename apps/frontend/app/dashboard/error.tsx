"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void; // A function to instantly try re-rendering the segment
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to your monitoring service (e.g., Sentry, LogRocket)
    console.error("Caught by Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center border border-dashed rounded-lg bg-red-50/50">
      <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-4 text-xl font-bold">
        ⚠️
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong!
      </h2>

      <p className="text-sm text-gray-600 max-w-md mb-6">
        {error.message ||
          "An unexpected error occurred while loading this section."}
      </p>

      <button
        onClick={() => reset()} // Attempts to recover by re-rendering the route
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}
