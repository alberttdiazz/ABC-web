'use client';
import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollY } = window;
      const { scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setWidth(total > 0 ? (scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="fixed top-16 lg:top-20 inset-x-0 z-30 h-0.5 bg-teal/10 pointer-events-none">
      <div
        className="h-full bg-teal"
        style={{ width: `${width}%`, transition: 'none' }}
      />
    </div>
  );
}
