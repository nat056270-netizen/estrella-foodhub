import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
export default function AsyncForm({
  onSubmit,
  children,
  className = '',
  error,
  onBusyChange
}) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try {
      await onSubmit(event);
    } finally {
      pending.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };
  return <form onSubmit={submit} aria-busy={busy}>
    {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl p-3 mb-4">{error}</p>}
    <fieldset disabled={busy} className={`min-w-0 ${className}`}>{children}</fieldset>
    {busy && <p className="flex items-center gap-2 text-sm text-gray-500 mt-3" role="status"><Loader2 size={16} className="animate-spin" /> Saving changes…</p>}
  </form>;
}
