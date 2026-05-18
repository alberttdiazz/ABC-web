'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type State = 'hidden' | 'visible' | 'fading';

export default function LoadingScreen() {
  const [state, setState] = useState<State>('hidden');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('abc_loaded')) return;
    setState('visible');

    const duration = 1600;
    const start = Date.now();

    const tick = () => {
      const p = Math.min(((Date.now() - start) / duration) * 100, 100);
      setProgress(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setState('fading');
          setTimeout(() => {
            setState('hidden');
            sessionStorage.setItem('abc_loaded', '1');
          }, 500);
        }, 150);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  if (state === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-cream flex flex-col items-center justify-center transition-opacity duration-500 ${
        state === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Image
        src="/logos/ABC-sin-servicios-transparente.png"
        alt="ABC Centre"
        width={220}
        height={130}
        className="object-contain mb-10"
        priority
      />
      <div className="w-52 h-0.5 bg-teal/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full"
          style={{ width: `${progress}%`, transition: 'width 40ms linear' }}
        />
      </div>
    </div>
  );
}
