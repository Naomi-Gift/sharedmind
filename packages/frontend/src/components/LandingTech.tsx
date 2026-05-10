const CHIPS = [
  { icon: '⬡', name: 'Kite Agent Passport',  desc: 'On-chain agent identity with session budget controls' },
  { icon: '◈', name: 'x402 Protocol',         desc: 'HTTP-native micropayments — signed per request' },
  { icon: '◎', name: 'USDC Settlement',        desc: 'Stablecoin-first — no price volatility on every prompt' },
  { icon: '⬡', name: 'Kite L1 Attestations',  desc: 'Immutable proof of every request, cost, and payment' },
  { icon: '▸', name: 'Claude Haiku + Sonnet',  desc: 'Auto-routed by prompt complexity for minimum cost' },
  { icon: '▸', name: 'GPT-4o',                 desc: 'Complex tasks routed automatically when needed' },
  { icon: '◈', name: 'Group Pool Contract',    desc: 'Solidity — deposit, debit, revenue split, withdraw' },
  { icon: '◎', name: 'Daily Streaks',          desc: 'Obsession mechanics — keep your group coming back every day' },
];

export default function LandingTech() {
  return (
    <section id="tech" className="relative z-[2] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="lp-reveal mb-12">
          <p className="section-label mb-3">Built On</p>
          <h2 className="font-display font-bold text-chalk leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Purpose-built<br />for collective intelligence.
          </h2>
        </div>

        {/* Grid — same surface pattern as PoolTab member cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px lp-reveal lp-d1" style={{ background: 'var(--wire)' }}>
          {CHIPS.map(c => (
            <div key={c.name} className="surface p-5 hover:bg-carbon transition-colors" style={{ borderRadius: 0, border: 'none' }}>
              <span className="font-mono text-[16px] text-phosphor mb-3 block">{c.icon}</span>
              <div className="font-display font-bold text-[13px] text-chalk mb-1.5">{c.name}</div>
              <div className="font-body text-[12px] text-stone leading-[1.5]">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
