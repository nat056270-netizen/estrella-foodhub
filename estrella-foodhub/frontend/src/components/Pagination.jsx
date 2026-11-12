import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({
  page,
  pages,
  count,
  pageSize,
  onChange
}) {
  return <nav className="flex flex-wrap justify-between items-center gap-3 pt-5 mt-4 border-t" aria-label="Table pagination">
    <p className="text-xs text-gray-500">{count ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, count)} of {count} products</p>
    <div className="flex items-center gap-2"><button className="icon-button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page" title="Previous page" type="button"><ChevronLeft size={18} /></button><span className="text-xs text-gray-600">Page {page} of {pages}</span><button className="icon-button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page" title="Next page" type="button"><ChevronRight size={18} /></button></div>
  </nav>;
}
