const Loading = ({
  message = 'Loading...'
}) => <div className="loading-state" role="status" aria-live="polite" aria-busy="true">
    <div className="flex items-center gap-3 mb-6"><span className="spinner" /><span className="text-sm text-gray-600">{message}</span></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[0, 1, 2, 3].map(i => <div key={i} className="card space-y-4" aria-hidden="true"><div className="skeleton h-3 w-24" /><div className="skeleton h-8 w-32" /><div className="skeleton h-3 w-20" /></div>)}</div>
    <div className="card mt-5 space-y-5" aria-hidden="true">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-8 w-full" />)}</div>
  </div>;
export default Loading;
