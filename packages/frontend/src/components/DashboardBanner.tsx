'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWalletCtx } from '@/context/WalletContext';
import { useContracts } from '@/hooks/useContracts';

interface Stats {
  totalPool: number;
  totalRevenue: number;
  memberCount: number;
  streak: number;
}

const DEMO_STATS: Stats = {
  totalPool:    47.82,
  totalRevenue: 12.36,
  memberCount:  4,
  streak:       14,
};

export default function DashboardBanner() {
  const { address, connected } = useWalletCtx();
  const { getPoolBalance } = useContracts();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [myBal, setMyBal]     = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pool/stats').then(r => r.json()).catch(() => null),
      connected ? getPoolBalance() : Promise.resolve(null),
    ]).then(([poolData, bal]) => {
      if (poolData?.memberCount) {
        setStats({
          totalPool:    poolData.totalPool,
          totalRevenue: poolData.totalRevenue,
          memberCount:  poolData.memberCount,
          streak:       14, // from streaks system
        });
      } else {
        setStats(DEMO_STATS);
      }
      setMyBal(bal);
      setLoading(false);
    });
  }, [connected, getPoolBalance]);

  const s = stats ?? DEMO_STATS;
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface bracketed relative overflow-hidden"
        style={{ padding: '20px 24px' }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(0,232,122,0.04) 0%, transparent 60%)' }} />

        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          {/* Left — group identity */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
                      stroke="#00e87a" strokeWidth="1.2" fill="rgba(0,232,122,0.06)" />
                <circle cx="11" cy="11" r="2.5" fill="#00e87a" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[15px] text-chalk tracking-tight">SharedMind Demo</span>
                <span className="tag tag-phosphor" style={{ fontSize: 8 }}>
                  <span className="live-dot" style={{ width: 4, height: 4 }} />
                  Active
                </span>
              </div>
              <div className="font-mono text-[9px] text-ash tracking-widest mt-0.5">
                {short ? `${short} · ` : ''}{s.memberCount} members
              </div>
            </div>
          </div>

          {/* Center — key metrics */}
          <div className="flex items-center gap-6 flex-wrap">
            {loading ? (
              <SkeletonStats />
            ) : (
              <>
                <Metric
                  label="Pool"
                  value={`$${s.totalPool.toFixed(2)}`}
                  color="var(--phosphor)"
                />
                <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
                <Metric
                  label="Earned"
                  value={`$${s.totalRevenue.toFixed(2)}`}
                  color="var(--gold)"
                />
                <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
                <Metric
                  label="Streak"
                  value={`${s.streak}d 🔥`}
                  color="var(--ember)"
                />
                {myBal !== null && myBal > 0 && (
                  <>
                    <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
                    <Metric
                      label="My Balance"
                      value={`$${myBal.toFixed(2)}`}
                      color="var(--signal)"
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Right — quick action */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="font-mono text-[9px] text-ash tracking-widest hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[16px] font-bold tabular leading-none" style={{ color }}>
        {value}
      </div>
      <div className="font-mono text-[8px] text-ash tracking-widest mt-0.5 uppercase">{label}</div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="flex items-center gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <div className="h-4 w-14 rounded-sm bg-[rgba(255,255,255,0.06)] animate-pulse mb-1" />
          <div className="h-2 w-8 rounded-sm bg-[rgba(255,255,255,0.04)] animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  );
}
