'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Lenis smooth scrolling for the landing page synchronized with GSAP ScrollTrigger.
 * The GSAP ticker drives Lenis's requestAnimationFrame loop so scroll coordinates
 * and scroll-triggered animations remain in lockstep at 60/120fps.
 *
 * Honors prefers-reduced-motion: reduce.
 * Elements with `data-lenis-prevent` (dialogs) keep native touch/wheel scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
      }

      if (motion.matches) return;

      lenis = new Lenis({
        autoRaf: false, // Driven by GSAP ticker for synchronized ScrollTrigger updates
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.6,
      });

      // Synchronize Lenis scroll position with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Add Lenis to window for programmatic scroll calls
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

      // Drive Lenis RAF from GSAP ticker
      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    };

    start();

    // Smooth anchor navigation (#properties, #process, #testimonials, #blog, #cta)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement && lenis) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -20,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    motion.addEventListener('change', start);

    // Refresh ScrollTrigger after font & image load
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener('click', handleAnchorClick);
      motion.removeEventListener('change', start);
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}

