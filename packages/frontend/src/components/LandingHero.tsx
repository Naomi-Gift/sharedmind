'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletCtx } from '@/context/WalletContext';
import WalletModal from './WalletModal';

export default function LandingHero() {
  const [showModal, setShowModal] = useState(false);
  const { connected } = useWalletCtx();
  const router = useRouter();

  const handleLaunch = () => {
    if (connected) router.push('/app');
    else setShowModal(true);
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .lp-hero-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(64px, 11vw, 140px);
          line-height: 0.92; letter-spacing: -0.03em; margin-bottom: 8px;
          opacity: 0; animation: lp-fadeUp 0.9s 0.35s ease forwards;
        }
        .lp-line2 { display: block; color: var(--phosphor); text-shadow: 0 0 60px rgba(0,232,122,0.25); }
        .lp-hero-eyebrow { opacity: 0; animation: lp-fadeUp 0.8s 0.2s ease forwards; }
        .lp-hero-sub     { opacity: 0; animation: lp-fadeUp 0.9s 0.55s ease forwards; }
        .lp-hero-btns    { opacity: 0; animation: lp-fadeUp 0.9s 0.75s ease forwards; }
        .lp-hero-stats   { opacity: 0; animation: lp-fadeUp 0.9s 0.95s ease forwards; }
        .lp-scroll-cue {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; animation: lp-fadeIn 1s 1.3s ease forwards;
        }
        .lp-scroll-line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, var(--ash), transparent);
          animation: lp-scrollDown 2s ease-in-out infinite;
        }
      `}</style>

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 relative overflow-hidden z-[2]">
        <div className="lp-hero-eyebrow flex items-center gap-2 mb-9 flex-wrap justify-center">
          <span className="tag tag-phosphor">
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            Live
          </span>
          <span className="tag tag-signal">AI Payments</span>
          <span className="tag tag-neutral">USDC · On-Chain</span>
        </div>

        <h1 className="lp-hero-title">
          <span className="block text-chalk">GROUP</span>
          <span className="lp-line2">INTELLIGENCE</span>
        </h1>

        <p className="lp-hero-sub font-body text-[17px] text-stone max-w-[540px] leading-[1.7] mt-7">
          Pool USDC. Access any AI. Build <strong className="text-chalk font-semibold">shared knowledge on-chain</strong>.
          Then sell it to the world — and let the protocol <strong className="text-chalk font-semibold">pay you back</strong>.
        </p>

        <div className="lp-hero-btns flex gap-3 mt-11 justify-center flex-wrap">
          <button onClick={handleLaunch} className="btn btn-primary text-[11px] py-3 px-7">
            {connected ? 'Open App ↗' : 'Launch App ↗'}
          </button>
          <a href="#how" className="btn btn-outline text-[11px] py-3 px-7">See How It Works</a>
        </div>

        <div className="lp-hero-stats flex gap-3 mt-16 justify-center flex-wrap">
          {[
            { num: '$0.0009', label: 'per AI request' },
            { num: 'x402',    label: 'per-request payments' },
            { num: '⬡',       label: 'On-Chain Identity' },
            { num: 'USDC',    label: 'stablecoin settled' },
          ].map(s => (
            <div key={s.num} className="surface-raised flex items-center gap-3 px-4 py-2.5">
              <span className="font-mono text-[13px] font-bold text-phosphor">{s.num}</span>
              <span className="font-mono text-[9px] text-ash tracking-widest uppercase">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="lp-scroll-cue">
          <span className="font-mono text-[9px] text-ash tracking-[0.18em] uppercase">Scroll</span>
          <div className="lp-scroll-line" />
        </div>
      </section>

      <WalletModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnected={() => { setShowModal(false); router.push('/app'); }}
      />
    </>
  );
}
