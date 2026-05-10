'use client';

import { motion } from 'framer-motion';

const STATS = [
  { label: 'Pool Balance',   value: '$47.82', sub: 'USDC locked',          color: 'text-phosphor', shadow: '0 0 12px rgba(0,232,122,0.3)' },
  { label: 'Revenue Earned', value: '$12.36', sub: 'From agent queries',   color: 'text-gold',     shadow: '0 0 12px rgba(240,180,41,0.3)' },
  { label: 'Members',        value: '4',      sub: 'Active contributors',  color: 'text-signal',   shadow: '0 0 12px rgba(59,158,255,0.3)' },
  { label: 'Queries Sold',   value: '103',    sub: 'External API calls',   color: 'text-chalk',    shadow: 'none' },
];

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative">
      {/* Decorative vertical line */}
      <div className="absolute left-6 top-16 bottom-0 w-px"
           style={{ background: 'linear-gradient(to bottom, rgba(0,232,122,0.3), transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pl-8"
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <span className="tag tag-phosphor">
            <span className="live-dot" style={{ width: 4, height: 4 }} />
            Live
          </span>
          <span className="tag tag-signal">AI Payments</span>
          <span className="tag tag-neutral">USDC · On-Chain</span>
        </div>

        {/* Headline — display font, large */}
        <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
          <span className="text-chalk block">Your group&apos;s AI usage</span>
          <span className="glow-text block">becomes an asset.</span>
        </h1>

        <p className="text-stone text-[15px] max-w-[500px] leading-[1.7] mb-10 font-body">
          Pool USDC on-chain. Your shared agent pays AI APIs per request.
          Every response is attested on-chain — and earns USDC
          when other agents query your collective knowledge.
        </p>

        {/* Flow steps — terminal style */}
        <div className="surface-inset inline-flex flex-wrap gap-0 mb-12 overflow-hidden">
          {[
            { n: '01', label: 'Pool USDC' },
            { n: '02', label: 'Agent pays AI' },
            { n: '03', label: 'Attest on-chain' },
            { n: '04', label: 'Knowledge grows' },
            { n: '05', label: 'Earn from queries' },
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2 px-4 py-2.5 border-r"
                   style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-[9px] text-ash tracking-widest">{s.n}</span>
                <span className="font-mono text-[11px] text-chalk">{s.label}</span>
              </div>
              {i < 4 && (
                <span className="font-mono text-[10px] text-ash px-1">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
              className="surface bracketed p-4 group cursor-default"
            >
              <div
                className={`font-mono text-[26px] font-bold tabular ${stat.color} leading-none mb-2`}
                style={{ textShadow: stat.shadow }}
              >
                {stat.value}
              </div>
              <div className="font-body text-[12px] text-chalk font-medium">{stat.label}</div>
              <div className="font-mono text-[9px] text-ash tracking-wider mt-0.5 uppercase">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
