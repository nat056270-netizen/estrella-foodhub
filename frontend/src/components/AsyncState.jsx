import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
export function ErrorState({
  message = 'We couldn’t load this information. Check your connection and try again.',
  onRetry
}) {
  return <div className="async-state" role="alert"><span className="state-icon"><AlertCircle size={25} /></span><h2>Something needs attention</h2><p>{message}</p>{onRetry && <button className="btn btn-secondary" onClick={onRetry} type="button"><RefreshCw size={16} /> Try again</button>}</div>;
}
export function EmptyState({
  title = 'Nothing here yet',
  message = 'Records will appear here when they are available.'
}) {
  return <div className="async-state"><span className="state-icon"><Inbox size={25} /></span><h3>{title}</h3><p>{message}</p></div>;
}
