'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Lenis smooth scrolling for the landing page only (the dashboard keeps native
 * scroll). Lenis moves the real window scroll position, so CSS scroll-driven
 * animations keep working. Skipped entirely for prefers-reduced-motion.
 * Elements with `data-lenis-prevent` (the dialogs) keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const start = () => {
      lenis?.destroy();
      lenis = motion.matches
        ? null
        : new Lenis({
            autoRaf: true,
            anchors: true,
            lerp: 0.1,
          });
    };

    start();
    motion.addEventListener('change', start);
    return () => {
      motion.removeEventListener('change', start);
      lenis?.destroy();
    };
  }, []);

  return null;
}
