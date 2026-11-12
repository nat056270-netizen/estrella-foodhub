import { useEffect, useRef, useState } from 'react';

export default function CartItems({ items, children }) {
  const [exiting, setExiting] = useState([]);
  const previous = useRef(items);
  const timers = useRef(new Set());
  useEffect(() => {
    const removed = previous.current.filter(item => !items.some(next => next.product_id === item.product_id));
    if (removed.length) {
      setExiting(current => [...current.filter(item => !removed.some(next => next.product_id === item.product_id)), ...removed]);
      const timer = setTimeout(() => {
        setExiting(current => current.filter(item => !removed.some(next => next.product_id === item.product_id)));
        timers.current.delete(timer);
      }, 150);
      timers.current.add(timer);
    }
    previous.current = items;
  }, [items]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  return <div className="cart-items-motion">
    {children}
    {exiting.map(item => <div key={item.product_id} className="cart-exit" aria-hidden="true"><span>{item.name}</span><span>Removed</span></div>)}
  </div>;
}

