import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import Modal from './Modal';
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const confirm = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" busy={busy} role="alertdialog">
    <div className="flex items-start gap-4 mb-6"><span className="p-3 rounded-xl bg-red-50 text-red-600"><AlertTriangle size={22} /></span><p className="text-sm text-gray-600 leading-relaxed">{message}</p></div>
    <div className="flex flex-wrap justify-end gap-3"><button autoFocus className="btn btn-secondary" onClick={onClose} disabled={busy} type="button">{cancelText}</button><button className="btn btn-danger" onClick={confirm} disabled={busy} type="button">{busy && <Loader2 size={16} className="animate-spin" />}{busy ? 'Please wait…' : confirmText}</button></div>
  </Modal>;
};
export default ConfirmDialog;
