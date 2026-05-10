'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletCtx } from '@/context/WalletContext';
import WalletModal from './WalletModal';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { connected } = useWalletCtx();
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLaunch = () => {
    if (connected) {
      router.push('/app');
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6 border-b transition-all duration-300"
        style={{
          borderColor: scrolled ? 'var(--wire)' : 'transparent',
          background: scrolled ? 'rgba(8,12,10,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        {/* Logo — links to / */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
                  stroke="#00e87a" strokeWidth="1" fill="rgba(0,232,122,0.06)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0,232,122,0.4))' }} />
            <circle cx="11" cy="11" r="2.5" fill="#00e87a" style={{ filter: 'drop-shadow(0 0 3px #00e87a)' }} />
          </svg>
          <span className="font-display font-bold text-[15px] tracking-tight text-chalk group-hover:text-phosphor transition-colors">
            SHARED<span className="text-phosphor">MIND</span>
          </span>
          <span className="hidden sm:block tag tag-neutral">Group Intelligence Protocol</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-5 font-mono text-[9px] tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-stone">
              <span className="live-dot" />
              Live
            </span>
            <span className="flex items-center gap-1.5 text-stone">
              <span className="signal-dot" />
              AI Active
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href="#how"  className="font-mono text-[9px] tracking-widest uppercase text-stone hover:text-chalk transition-colors">How It Works</a>
            <a href="#earn" className="font-mono text-[9px] tracking-widest uppercase text-stone hover:text-chalk transition-colors">Earn</a>
            <a href="#tech" className="font-mono text-[9px] tracking-widest uppercase text-stone hover:text-chalk transition-colors">Tech</a>
          </div>
          <button onClick={handleLaunch} className="btn btn-primary text-[10px] py-2 px-4">
            {connected ? 'Open App ↗' : 'Launch App ↗'}
          </button>
        </div>
      </nav>

      <WalletModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnected={() => { setShowModal(false); router.push('/app'); }}
      />
    </>
  );
}
