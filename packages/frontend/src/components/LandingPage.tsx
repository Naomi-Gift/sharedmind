'use client';

import { useEffect } from 'react';
import LandingCanvas from './LandingCanvas';
import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingMarquee from './LandingMarquee';
import LandingHow from './LandingHow';
import LandingMoney from './LandingMoney';
import LandingEarnFeature from './LandingEarnFeature';
import LandingTech from './LandingTech';
import LandingQuote from './LandingQuote';
import LandingCTA from './LandingCTA';
import LandingFooter from './LandingFooter';
import LandingCursor from './LandingCursor';

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Keyframes only — all component styles use the shared globals.css system */}
      <style>{`
        .lp-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .lp-reveal.lp-visible { opacity: 1; transform: translateY(0); }
        .lp-d1 { transition-delay: 0.1s; } .lp-d2 { transition-delay: 0.2s; }
        .lp-d3 { transition-delay: 0.3s; } .lp-d4 { transition-delay: 0.4s; }

        @keyframes lp-fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes lp-blink     { 0%,100%{opacity:1;box-shadow:0 0 6px var(--phosphor)} 50%{opacity:0.3;box-shadow:none} }
        @keyframes lp-scrollDown{ 0%,100%{transform:scaleY(1);transform-origin:top} 50%{transform:scaleY(0.5);transform-origin:bottom} }
        @keyframes lp-marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* Noise overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.018]"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />

      <LandingCursor />
      <LandingCanvas />
      <LandingNav />
      <LandingHero />
      <LandingMarquee />
      <LandingHow />
      <LandingMoney />
      <LandingEarnFeature />
      <LandingTech />
      <LandingQuote />
      <LandingCTA />
      <LandingFooter />
    </>
  );
}
