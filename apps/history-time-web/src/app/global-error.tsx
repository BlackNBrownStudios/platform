'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-4">
            We encountered an unexpected error. Please try refreshing the page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 p-4 rounded mb-4">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Try again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
}
