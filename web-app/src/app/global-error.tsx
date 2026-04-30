'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
              <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bomb text-red-500 text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Critical Error</h2>
              <p className="text-gray-300 mb-6">
                A critical error occurred. Please refresh the page or contact support if the problem persists.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
