const ITEMS = [
  'Kite Agent Passport', 'x402 Protocol', 'USDC Micropayments',
  'Group Memory On-Chain', 'Earn From Intelligence', 'Claude Haiku · Sonnet',
  'GPT-4o Routing', 'Kite L1 Attestations', 'Daily Streaks', 'Group Chat',
];

export default function LandingMarquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <>
      <style>{`
        .lp-marquee-track { display: flex; animation: lp-marquee 28s linear infinite; white-space: nowrap; }
      `}</style>
      <div className="overflow-hidden py-5 relative z-[2] border-t border-b" style={{ borderColor: 'var(--wire)' }}>
        <div className="lp-marquee-track">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-9 font-mono text-[10px] text-ash tracking-[0.08em] uppercase">
              <span className="w-[3px] h-[3px] rounded-full flex-shrink-0" style={{ background: 'var(--phosphor)' }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
