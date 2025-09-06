export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="p-6 border border-red-200 bg-red-50 text-red-800 rounded-md">
      <div className="font-semibold mb-2">Error</div>
      <div className="text-sm">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 inline-flex items-center rounded bg-red-600 text-white px-3 py-1 text-sm hover:bg-red-700">
          Retry
        </button>
      )}
    </div>
  );
}
