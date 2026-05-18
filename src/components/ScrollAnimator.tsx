'use client';
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

export default function ScrollAnimator() {
  const pathname = usePathname();

  useEffect(() => {
    // Disconnect any previous observer before creating a new one
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay to ensure Next.js has finished painting the new page DOM
    const timer = setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]); // Re-run every time the route changes

  return null;
}
