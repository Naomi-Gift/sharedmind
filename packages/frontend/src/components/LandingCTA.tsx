'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletCtx } from '@/context/WalletContext';
import WalletModal from './WalletModal';

import Link from 'next/link';

export default function LandingCTA() {
  const [showModal, setShowModal] = useState(false);
  const { connected } = useWalletCtx();
  const router = useRouter();

  const handleLaunch = () => {
    if (connected) router.push('/app');
    else setShowModal(true);
  };

  return (
    <>
      <section className="relative z-[2] py-32 px-6 text-center overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(0,232,122,0.07), transparent 70%)' }} />

        <div className="relative z-10 lp-reveal">
          <h2 className="font-display font-bold text-chalk leading-[0.9] tracking-tight mb-6"
              style={{ fontSize: 'clamp(52px, 9vw, 110px)' }}>
            READY<br />TO <span className="glow-text">BUILD?</span>
          </h2>
          <p className="font-body text-[16px] text-stone max-w-[420px] mx-auto mb-11 leading-[1.7]">
            Deploy your group pool, invite your team, and start earning from your collective intelligence.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleLaunch} className="btn btn-primary text-[11px] py-3 px-8">
              {connected ? 'Open SharedMind ↗' : 'Launch SharedMind ↗'}
            </button>
            <Link href="/docs" className="btn btn-outline text-[11px] py-3 px-8">Read the Docs</Link>
          </div>
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
