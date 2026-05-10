'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWalletCtx } from '@/context/WalletContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onConnected?: (address: string) => void;
}

export default function WalletModal({ open, onClose, onConnected }: Props) {
  const { connect, connecting, error } = useWalletCtx();

  const handleConnect = async () => {
    const addr = await connect();
    if (addr) {
      onConnected?.(addr);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(8,12,10,0.85)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm"
          >
            <div className="surface bracketed p-7" style={{ borderColor: 'rgba(0,232,122,0.2)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="section-label mb-1">Connect Wallet</p>
                  <p className="font-body text-[13px] text-stone">Required to access SharedMind</p>
                </div>
                <button onClick={onClose} className="font-mono text-[16px] text-ash hover:text-chalk transition-colors leading-none">×</button>
              </div>

              {/* MetaMask option */}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full surface-raised flex items-center gap-4 px-4 py-4 hover:border-[rgba(0,232,122,0.25)] transition-all group mb-3"
                style={{ borderRadius: 4 }}
              >
                {/* MetaMask fox icon */}
                <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 text-[22px]"
                     style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
                  🦊
                </div>
                <div className="flex-1 text-left">
                  <div className="font-body text-[14px] font-semibold text-chalk">MetaMask</div>
                  <div className="font-mono text-[9px] text-ash tracking-widest">Browser extension wallet</div>
                </div>
                {connecting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="font-mono text-[14px] text-phosphor"
                  >
                    ⬡
                  </motion.div>
                ) : (
                  <span className="font-mono text-[10px] text-ash group-hover:text-phosphor transition-colors">→</span>
                )}
              </button>

              {/* WalletConnect placeholder */}
              <button
                className="w-full surface-raised flex items-center gap-4 px-4 py-4 opacity-40 cursor-not-allowed mb-5"
                style={{ borderRadius: 4 }}
                disabled
              >
                <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 text-[22px]"
                     style={{ background: 'rgba(59,158,255,0.1)', border: '1px solid rgba(59,158,255,0.2)' }}>
                  🔗
                </div>
                <div className="flex-1 text-left">
                  <div className="font-body text-[14px] font-semibold text-chalk">WalletConnect</div>
                  <div className="font-mono text-[9px] text-ash tracking-widest">Coming soon</div>
                </div>
              </button>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-[10px] tracking-wider px-3 py-2 mb-4"
                  style={{ borderRadius: 2, color: 'var(--ember)', border: '1px solid rgba(255,107,74,0.25)', background: 'rgba(255,107,74,0.05)' }}
                >
                  ⚠ {error}
                </motion.div>
              )}

              <p className="font-mono text-[9px] text-ash tracking-wider text-center leading-relaxed">
                By connecting you agree to interact with Kite chain.
                <br />Your funds are controlled by smart contracts only.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
