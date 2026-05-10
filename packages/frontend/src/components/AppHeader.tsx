'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWalletCtx } from '@/context/WalletContext';
import WalletModal from './WalletModal';

export default function AppHeader() {
  const { connected, address, disconnect } = useWalletCtx();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu]   = useState(false);

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b scan-line"
        style={{ background: 'rgba(8,12,10,0.92)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[52px] flex items-center justify-between">
          {/* Logo — links back to landing */}
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 font-mono text-[9px] tracking-widest uppercase">
              <span className="flex items-center gap-1.5 text-stone">
                <span className="live-dot" />
                Kite Chain
              </span>
              <span className="flex items-center gap-1.5 text-stone">
                <span className="signal-dot" />
                x402 Active
              </span>
            </div>

            {connected ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(m => !m)}
                  className="flex items-center gap-2 surface-raised px-3 py-1.5 hover:border-[rgba(0,232,122,0.25)] transition-all"
                  style={{ borderRadius: 4 }}
                >
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  <span className="font-mono text-[10px] text-chalk tracking-wider">{short}</span>
                  <span className="font-mono text-[10px] text-ash">▾</span>
                </button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-1 surface-raised py-1 min-w-[140px] z-50"
                    style={{ borderRadius: 4 }}
                  >
                    <button
                      onClick={() => { disconnect(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 font-mono text-[10px] text-stone hover:text-ember tracking-widest uppercase transition-colors"
                    >
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-outline text-[10px] py-[6px] px-4"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <WalletModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
