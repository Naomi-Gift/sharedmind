'use client';

import { useEffect, useRef } from 'react';

export default function LandingCursor() {
  const curRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide cursor only while on the landing page
    document.documentElement.classList.add('lp-cursor-active');

    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = mx + 'px';
        curRef.current.style.top  = my + 'px';
      }
    };
    document.addEventListener('mousemove', onMove);

    let animId: number;
    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px';
        ringRef.current.style.top  = ry + 'px';
      }
      animId = requestAnimationFrame(animRing);
    };
    animRing();

    return () => {
      // Restore cursor when component unmounts (navigating away from landing)
      document.documentElement.classList.remove('lp-cursor-active');
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Only hide cursor when the landing cursor is active */
        html.lp-cursor-active,
        html.lp-cursor-active body { cursor: none !important; }

        .lp-cursor {
          position: fixed; width: 12px; height: 12px; border-radius: 50%;
          background: var(--phosphor); mix-blend-mode: screen;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s;
          display: none;
        }
        html.lp-cursor-active .lp-cursor { display: block; }

        .lp-cursor-ring {
          position: fixed; width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(0,232,122,0.35);
          pointer-events: none; z-index: 9998;
          transform: translate(-50%, -50%);
          display: none;
        }
        html.lp-cursor-active .lp-cursor-ring { display: block; }

        html.lp-cursor-active body:has(a:hover) .lp-cursor,
        html.lp-cursor-active body:has(button:hover) .lp-cursor {
          width: 20px; height: 20px;
        }
      `}</style>
      <div ref={curRef}  className="lp-cursor" />
      <div ref={ringRef} className="lp-cursor-ring" />
    </>
  );
}
