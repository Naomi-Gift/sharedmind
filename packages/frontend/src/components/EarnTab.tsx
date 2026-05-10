'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IncomingQuery } from '@/types';

const MEMBERS = [
  { address: '0xDeFi…a1b2', role: 'DeFi Researcher', earned: 3.10, rep: 87, share: 31, initials: 'DR', color: 'var(--phosphor)' },
  { address: '0xLaw…c3d4',  role: 'Crypto Lawyer',   earned: 2.40, rep: 72, share: 26, initials: 'CL', color: 'var(--signal)'   },
  { address: '0xMed…e5f6',  role: 'Med Researcher',  earned: 1.80, rep: 65, share: 23, initials: 'MR', color: 'var(--gold)'     },
  { address: '0xTrd…g7h8',  role: 'Quant Trader',    earned: 1.06, rep: 58, share: 20, initials: 'QT', color: 'var(--ember)'    },
];

const SEED: IncomingQuery[] = [
  { payer: '0xAgent…bot1', query: 'DeFi yield strategies',        paid: 0.12, timestamp: Date.now() - 300000 },
  { payer: '0xAgent…bot2', query: 'Smart contract audit',         paid: 0.12, timestamp: Date.now() - 240000 },
  { payer: '0xAgent…bot3', query: 'Clinical trial methodology',   paid: 0.12, timestamp: Date.now() - 180000 },
];

const LIVE_Q = [
  { payer: '0xAgent…ext1', query: 'Kite chain liquidity analysis' },
  { payer: '0xAgent…ext2', query: 'Legal framework for DAOs'      },
  { payer: '0xAgent…ext3', query: 'Drug repurposing research'     },
];

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

export default function EarnTab() {
  const [queries, setQueries]         = useState<IncomingQuery[]>(SEED);
  const [totalEarned, setTotalEarned] = useState(12.36);
  const [apiEndpoint]                 = useState('/api/query');

  // Poll query stats from backend
  useEffect(() => {
    fetch('/api/query/stats')
      .then(r => r.json())
      .then((d: { totalEntries?: number }) => {
        if (d?.totalEntries) setTotalEarned(d.totalEntries * 0.12);
      })
      .catch(() => {});
  }, []);

  // Simulate live incoming queries for demo
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const base = LIVE_Q[i++ % LIVE_Q.length];
      setQueries(prev => [{ ...base, paid: 0.12, timestamp: Date.now() }, ...prev].slice(0, 20));
      setTotalEarned(prev => parseFloat((prev + 0.12).toFixed(2)));
    }, 9000);
    return () => clearInterval(id);
  }, []);

  const FLYWHEEL = [
    { n: '01', label: 'Use SharedMind',       sub: 'Group builds knowledge'  },
    { n: '02', label: 'Attest on-chain',       sub: 'Immutable records'       },
    { n: '03', label: 'Corpus grows',          sub: 'Searchable by agents'    },
    { n: '04', label: 'Agents pay 0.12 USDC',  sub: 'Per query via x402'      },
    { n: '05', label: 'Revenue splits',        sub: 'By reputation weight'    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="surface bracketed relative overflow-hidden scanlines" style={{ padding: '40px 36px' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,232,122,0.06) 0%, transparent 60%)' }} />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div>
            <div className="section-label mb-4">Total Revenue Earned</div>
            <AnimatePresence mode="wait">
              <motion.div key={Math.floor(totalEarned * 10)} initial={{ opacity: 0.5, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="font-mono font-bold leading-none tabular glow-text" style={{ fontSize: 'clamp(48px, 6vw, 72px)' }}>
                ${totalEarned.toFixed(2)}
              </motion.div>
            </AnimatePresence>
            <div className="font-mono text-[10px] text-ash tracking-widest mt-3">USDC EARNED FROM EXTERNAL AGENT QUERIES</div>
          </div>
          <div className="surface-raised p-4">
            <div className="section-label mb-2">x402 API Endpoint</div>
            <div className="font-mono text-[10px] tracking-wider break-all leading-relaxed" style={{ color: 'var(--phosphor)' }}>
              POST {typeof window !== 'undefined' ? window.location.origin : 'https://sharedmind.app'}{apiEndpoint}
            </div>
            <div className="rule my-3" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag tag-gold">0.12 USDC / QUERY</span>
              <span className="tag tag-phosphor">x402</span>
              <span className="tag tag-signal">KITE CHAIN</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue split */}
        <div className="surface overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="section-label">Revenue Split</div>
            <div className="font-mono text-[9px] text-ash tracking-widest mt-0.5">WEIGHTED BY ON-CHAIN REPUTATION</div>
          </div>
          <div className="p-5 space-y-5">
            {MEMBERS.map((m, i) => (
              <motion.div key={m.address} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0"
                       style={{ background: `${m.color}12`, border: `1px solid ${m.color}30`, color: m.color, borderRadius: '2px' }}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-stone">{m.address}</span>
                      <span className="font-mono text-[13px] font-bold tabular"
                            style={{ color: 'var(--phosphor)', textShadow: '0 0 8px rgba(0,232,122,0.4)' }}>
                        ${m.earned.toFixed(2)}<span className="text-ash font-normal text-[9px] ml-1">({m.share}%)</span>
                      </span>
                    </div>
                    <div className="font-body text-[11px] text-stone">{m.role}</div>
                  </div>
                </div>
                <div className="h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${m.share}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Incoming queries */}
        <div className="surface overflow-hidden scanlines">
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="section-label">Incoming Queries</div>
              <div className="font-mono text-[9px] text-ash tracking-widest mt-0.5">AGENTS PAYING TO QUERY YOUR KNOWLEDGE</div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-ash tracking-widest">
              <span className="live-dot" />LIVE
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {queries.map(q => (
                <motion.div key={`${q.payer}-${q.timestamp}`}
                  initial={{ opacity: 0, backgroundColor: 'rgba(0,232,122,0.05)' }}
                  animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-between gap-4 px-5 py-3 border-b hover:bg-[rgba(255,255,255,0.015)] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="min-w-0">
                    <div className="font-body text-[12px] text-chalk truncate">{q.query}</div>
                    <div className="font-mono text-[9px] text-ash mt-0.5 tracking-wider">{q.payer}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-[13px] font-bold tabular glow-text">+${q.paid.toFixed(2)}</div>
                    <div className="font-mono text-[9px] text-ash tabular tracking-wider">{timeAgo(q.timestamp)} AGO</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Flywheel */}
      <div className="surface p-5">
        <div className="section-label mb-5">The Earn Flywheel</div>
        <div className="flex items-start overflow-x-auto pb-2 gap-0">
          {FLYWHEEL.map((s, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="text-center px-5 first:pl-0">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center font-mono text-[9px] tracking-widest"
                     style={{ border: '1px solid rgba(0,232,122,0.25)', background: 'rgba(0,232,122,0.05)', color: 'var(--phosphor)', borderRadius: '2px' }}>
                  {s.n}
                </div>
                <div className="font-mono text-[10px] text-chalk whitespace-nowrap tracking-wide">{s.label}</div>
                <div className="font-mono text-[9px] text-ash mt-0.5 whitespace-nowrap tracking-wider">{s.sub}</div>
              </div>
              {i < FLYWHEEL.length - 1 && <span className="font-mono text-[12px] text-ash flex-shrink-0 px-1">›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
