'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWalletCtx } from '@/context/WalletContext';
import WalletModal from './WalletModal';

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { connected, address } = useWalletCtx();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Give the wallet context a tick to restore from sessionStorage
    const t = setTimeout(() => setChecked(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (checked && !connected) setShowModal(true);
  }, [checked, connected]);

  // Not yet checked — show nothing to avoid flash
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="font-mono text-[28px] text-phosphor"
        >
          ⬡
        </motion.div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--void)' }}>
        {/* Background grid */}
        <div className="fixed inset-0 opacity-[0.35]"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="fixed inset-0"
             style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,232,122,0.07) 0%, transparent 60%)' }} />

        <div className="relative z-10">
          <div className="font-mono text-[40px] text-phosphor mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(0,232,122,0.5))' }}>⬡</div>
          <h1 className="font-display font-bold text-chalk text-[28px] tracking-tight mb-2">
            SHARED<span className="text-phosphor">MIND</span>
          </h1>
          <p className="font-body text-[14px] text-stone mb-8 max-w-xs leading-relaxed">
            Connect your wallet to access the group intelligence protocol.
          </p>

          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary text-[11px] py-3 px-8"
            >
              Connect Wallet
            </button>
            <button
              onClick={() => router.push('/')}
              className="font-mono text-[9px] text-ash tracking-widest hover:text-stone transition-colors uppercase"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <WalletModal
          open={showModal}
          onClose={() => { setShowModal(false); router.push('/'); }}
          onConnected={() => setShowModal(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
}
