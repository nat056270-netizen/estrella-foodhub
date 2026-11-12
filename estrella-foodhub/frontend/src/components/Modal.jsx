import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
let activeDialogs = 0;
let previousOverflow = '';
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  busy = false,
  role = 'dialog'
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    if (activeDialogs === 0) previousOverflow = document.body.style.overflow;
    activeDialogs += 1;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      activeDialogs = Math.max(0, activeDialogs - 1);
      if (activeDialogs === 0) document.body.style.overflow = previousOverflow;
      const parentDialog = previousFocus?.closest?.('dialog');
      if (previousFocus?.isConnected && (!parentDialog || parentDialog.open)) previousFocus.focus();
      else if (activeDialogs === 0) document.querySelector('#main-content')?.focus();
    };
  }, [isOpen]);
  return createPortal(<dialog ref={dialogRef} className={`app-dialog dialog-${size}`} role={role} aria-labelledby={titleId} aria-busy={busy} onCancel={event => {
    event.preventDefault();
    if (!busy) closeRef.current();
  }} onClick={event => {
    if (event.target === event.currentTarget && !busy) {
      const b = event.currentTarget.getBoundingClientRect();
      if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) closeRef.current();
    }
  }}>
    <div className="dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog" title="Close dialog"><X size={20} /></button></div>
    <div className="dialog-content">{children}</div>
  </dialog>, document.body);
};
export default Modal;
