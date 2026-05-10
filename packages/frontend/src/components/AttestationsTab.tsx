'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryEntry } from '@/types';

const MODEL_META: Record<string, { label: string; tagCls: string; barColor: string }> = {
  'claude-haiku-20240307': { label: 'HAIKU',  tagCls: 'tag-signal',   barColor: 'var(--signal)'   },
  'claude-sonnet-4-5':     { label: 'SONNET', tagCls: 'tag-phosphor', barColor: 'var(--phosphor)' },
  'gpt-4o':                { label: 'GPT-4O', tagCls: 'tag-gold',     barColor: 'var(--gold)'     },
};

const COST: Record<string, number> = {
  'claude-haiku-20240307': 0.0004,
  'claude-sonnet-4-5':     0.0031,
  'gpt-4o':                0.0082,
};

const SEED: MemoryEntry[] = [
  { member: '0xDeFi…a1b2', model: 'claude-haiku-20240307', prompt: 'DeFi yield strategies on Kite',   response: '', txHash: '0xabc123', requestHash: '0xabc123aa', timestamp: Date.now() - 120000 },
  { member: '0xLaw…c3d4',  model: 'claude-sonnet-4-5',     prompt: 'Smart contract audit checklist',  response: '', txHash: '0xbcd234', requestHash: '0xbcd234bb', timestamp: Date.now() - 90000  },
  { member: '0xMed…e5f6',  model: 'claude-haiku-20240307', prompt: 'Clinical trial data analysis',    response: '', txHash: '0xcde345', requestHash: '0xcde345cc', timestamp: Date.now() - 60000  },
  { member: '0xTrd…g7h8',  model: 'gpt-4o',                prompt: 'Arbitrage opportunity detection', response: '', txHash: '0xdef456', requestHash: '0xdef456dd', timestamp: Date.now() - 30000  },
];

type Filter = 'all' | 'claude-haiku-20240307' | 'claude-sonnet-4-5' | 'gpt-4o';

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

export default function AttestationsTab() {
  const [entries, setEntries] = useState<MemoryEntry[]>(SEED);
  const [filter, setFilter]   = useState<Filter>('all');

  // Poll real attestations from backend
  useEffect(() => {
    const load = () => {
      fetch('/api/agent/attestations')
        .then(r => r.json())
        .then((data: MemoryEntry[]) => { if (Array.isArray(data) && data.length) setEntries(data); })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const shown      = filter === 'all' ? entries : entries.filter(e => e.model === filter);
  const totalCost  = entries.reduce((s, e) => s + (COST[e.model] ?? 0), 0);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',                   label: 'ALL'    },
    { id: 'claude-haiku-20240307', label: 'HAIKU'  },
    { id: 'claude-sonnet-4-5',     label: 'SONNET' },
    { id: 'gpt-4o',                label: 'GPT-4O' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ATTESTATIONS', value: String(entries.length),                                                  color: 'var(--phosphor)' },
          { label: 'TOTAL COST',   value: `$${totalCost.toFixed(4)}`,                                              color: 'var(--gold)'     },
          { label: 'HAIKU CALLS',  value: String(entries.filter(e => e.model === 'claude-haiku-20240307').length), color: 'var(--signal)'   },
          { label: 'MEMBERS',      value: String(new Set(entries.map(e => e.member)).size),                        color: 'var(--chalk)'    },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="surface p-4">
            <div className="section-label mb-2">{s.label}</div>
            <div className="font-mono text-[24px] font-bold tabular leading-none"
                 style={{ color: s.color, textShadow: `0 0 10px ${s.color}40` }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`font-mono text-[9px] tracking-widest px-3 py-1.5 transition-all duration-150 ${
                filter === f.id
                  ? 'text-phosphor border border-[rgba(0,232,122,0.3)] bg-[rgba(0,232,122,0.06)]'
                  : 'text-ash hover:text-stone border border-transparent'
              }`} style={{ borderRadius: '2px' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-ash tracking-widest">
          <span className="live-dot" />LIVE FEED
        </div>
      </div>

      <div className="surface overflow-hidden scanlines">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="section-label">On-Chain Attestation Log</span>
          <span className="font-mono text-[9px] text-ash tracking-widest">IMMUTABLE // VERIFIED</span>
        </div>
        <div className="max-h-[460px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {shown.map(entry => {
              const m = MODEL_META[entry.model] ?? { label: entry.model, tagCls: 'tag-neutral', barColor: 'var(--ash)' };
              return (
                <motion.div key={entry.requestHash}
                  initial={{ opacity: 0, backgroundColor: 'rgba(0,232,122,0.04)' }}
                  animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.6 }}
                  className="flex items-start gap-4 px-5 py-3.5 border-b hover:bg-[rgba(255,255,255,0.015)] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="w-[2px] self-stretch rounded-full flex-shrink-0 mt-0.5"
                       style={{ background: m.barColor, boxShadow: `0 0 4px ${m.barColor}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-[10px] text-stone">{entry.member}</span>
                      <span className={`tag ${m.tagCls}`}>{m.label}</span>
                      <span className="font-mono text-[9px] tabular" style={{ color: 'var(--gold)' }}>
                        ${(COST[entry.model] ?? 0).toFixed(4)}
                      </span>
                    </div>
                    <div className="font-body text-[12px] text-chalk truncate">{entry.prompt}</div>
                    <div className="font-mono text-[9px] text-ash mt-0.5 truncate tracking-wider">{entry.requestHash}</div>
                  </div>
                  <span className="font-mono text-[9px] text-ash flex-shrink-0 tabular tracking-wider">
                    {timeAgo(entry.timestamp)} AGO
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
