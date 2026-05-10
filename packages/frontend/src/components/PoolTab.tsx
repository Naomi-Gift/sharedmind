'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PoolStats, MemberData } from '@/types';

const ACCENT = ['var(--phosphor)', 'var(--signal)', 'var(--gold)', 'var(--ember)'];

const DEMO: PoolStats = {
  totalPool: 47.82, totalRevenue: 12.36, queryPrice: 0.12, memberCount: 4,
  members: [
    { address: '0xDeFi1234...a1b2', balance: 18.50, reputation: 87, totalSpent: 4.20, totalEarned: 3.10, active: true, role: 'DeFi Researcher' },
    { address: '0xLaw5678...c3d4',  balance: 12.30, reputation: 72, totalSpent: 2.80, totalEarned: 2.40, active: true, role: 'Crypto Lawyer'   },
    { address: '0xMed9012...e5f6',  balance: 9.70,  reputation: 65, totalSpent: 1.90, totalEarned: 1.80, active: true, role: 'Med Researcher'  },
    { address: '0xTrd3456...g7h8',  balance: 7.32,  reputation: 58, totalSpent: 1.40, totalEarned: 1.06, active: true, role: 'Quant Trader'    },
  ],
};

export default function PoolTab() {
  const [stats, setStats]         = useState<PoolStats>(DEMO);
  const [depositAmt, setDeposit]  = useState('');
  const [deposited, setDeposited] = useState(false);

  useEffect(() => {
    fetch('/api/pool/stats')
      .then(r => r.json())
      .then((d: PoolStats) => { if (d?.members?.length) setStats(d); })
      .catch(() => {});
  }, []);

  const totalSpent = stats.members.reduce((s, m) => s + m.totalSpent, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'POOL BALANCE',   value: `$${stats.totalPool.toFixed(2)}`,   sub: 'USDC locked on-chain',  color: 'var(--phosphor)', shadow: '0 0 12px rgba(0,232,122,0.25)' },
          { label: 'TOTAL SPENT',    value: `$${totalSpent.toFixed(2)}`,         sub: 'AI API costs to date',  color: 'var(--gold)',     shadow: '0 0 12px rgba(240,180,41,0.2)'  },
          { label: 'REVENUE EARNED', value: `$${stats.totalRevenue.toFixed(2)}`, sub: 'From external queries', color: 'var(--phosphor)', shadow: '0 0 12px rgba(0,232,122,0.25)' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="surface bracketed p-5">
            <div className="section-label mb-3">{s.label}</div>
            <div className="font-mono text-[28px] font-bold tabular leading-none" style={{ color: s.color, textShadow: s.shadow }}>{s.value}</div>
            <div className="font-mono text-[9px] text-ash tracking-widest mt-2 uppercase">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="section-label">Members // {stats.memberCount} active</span>
            <span className="font-mono text-[9px] text-ash tracking-widest">REP = REVENUE WEIGHT</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {stats.members.map((m: MemberData, i: number) => {
              const color = ACCENT[i % ACCENT.length];
              const init  = m.address.slice(2, 4).toUpperCase();
              return (
                <motion.div key={m.address} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold"
                       style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>{init}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] text-chalk truncate">{m.address}</div>
                    <div className="font-body text-[11px] text-stone mt-0.5">{m.role ?? 'Member'}</div>
                  </div>
                  <div className="flex items-center gap-2 w-32 flex-shrink-0">
                    <div className="flex-1 h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.reputation}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    </div>
                    <span className="font-mono text-[10px] text-stone tabular w-5 text-right">{m.reputation}</span>
                  </div>
                  <div className="text-right flex-shrink-0 w-24">
                    <div className="font-mono text-[13px] text-chalk tabular font-bold">${m.balance.toFixed(2)}</div>
                    <div className="font-mono text-[10px] tabular" style={{ color: 'var(--phosphor)' }}>+${m.totalEarned.toFixed(2)}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Smart Contract</span>
              <span className="tag tag-phosphor"><span className="live-dot" style={{ width: 4, height: 4 }} />On-Chain</span>
            </div>
            <div className="surface-inset px-3 py-2.5 font-mono text-[10px] text-stone break-all leading-relaxed">
              {process.env.NEXT_PUBLIC_POOL_CONTRACT ?? '0x — deploy contract first'}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {['deposit()', 'debit()', 'creditRevenue()'].map(fn => (
                <div key={fn} className="surface-inset py-2 text-center font-mono text-[9px] tracking-wider" style={{ color: 'var(--phosphor)' }}>{fn}</div>
              ))}
            </div>
          </div>

          <div className="surface p-4">
            <p className="section-label mb-3">Top Up Balance</p>
            {deposited ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="font-mono text-[28px] mb-1" style={{ color: 'var(--phosphor)', textShadow: '0 0 20px rgba(0,232,122,0.5)' }}>&#10003;</div>
                <div className="font-mono text-[11px] tracking-widest" style={{ color: 'var(--phosphor)' }}>${depositAmt} USDC DEPOSITED</div>
                <div className="font-mono text-[9px] text-ash tracking-widest mt-1">ATTESTED ON-CHAIN</div>
              </motion.div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input type="number" value={depositAmt} onChange={e => setDeposit(e.target.value)}
                    placeholder="amount in USDC" className="field text-[12px] py-2.5" />
                  <button onClick={() => depositAmt && setDeposited(true)}
                    className="btn btn-primary flex-shrink-0 text-[10px] py-2.5 px-4">DEPOSIT</button>
                </div>
                <p className="font-mono text-[9px] text-ash tracking-wider mt-2">FUNDS HELD IN SMART CONTRACT // WITHDRAW ANYTIME</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
