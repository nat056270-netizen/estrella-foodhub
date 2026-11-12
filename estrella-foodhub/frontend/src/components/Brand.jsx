import { UtensilsCrossed } from 'lucide-react';
export default function Brand({
  compact = false
}) {
  return <div className="brand"><span className="brand-mark"><UtensilsCrossed size={23} aria-hidden="true" /></span>
    {!compact && <div><strong>estrella<span>.</span></strong><small>FOODHUB · POINT OF SALE</small></div>}</div>;
}
