import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

function textContent(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join(' ');
  return isValidElement(node) ? textContent(node.props.children) : '';
}

export default function ResponsiveTable({ children, className = '', label = 'Records', ...props }) {
  const region = useRef(null);
  const [overflow, setOverflow] = useState(false);
  const sections = Children.toArray(children);
  const head = sections.find(section => isValidElement(section) && section.type === 'thead');
  const headings = Children.toArray(head?.props.children).find(isValidElement);
  const labels = Children.toArray(headings?.props.children).map(cell => textContent(cell).trim());
  useEffect(() => {
    const node = region.current;
    if (!node) return;
    const measure = () => setOverflow(node.scrollWidth > node.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, [children]);
  const content = sections.map(section => {
    if (!isValidElement(section) || section.type !== 'tbody') return section;
    return cloneElement(section, { role: 'rowgroup' }, Children.toArray(section.props.children).map(row => {
      if (!isValidElement(row) || row.type !== 'tr') return row;
      return cloneElement(row, { role: 'row' }, Children.toArray(row.props.children).map((cell, index) => {
        if (!isValidElement(cell) || cell.type !== 'td') return cell;
        const name = labels[index] || 'Details';
        return cloneElement(cell, { role: 'cell', 'data-label': name, 'data-actions': /actions/i.test(name) || undefined });
      }));
    }));
  });
  return <div className="responsive-table-shell">
    {overflow && <p className="table-scroll-hint">Scroll sideways to view all columns.</p>}
    <div ref={region} className="responsive-table-region" role="region" aria-label={label} tabIndex={overflow ? 0 : -1}>
      <table {...props} role="table" className={`responsive-table ${className}`}>{content}</table>
    </div>
  </div>;
}

