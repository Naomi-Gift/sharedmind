const CARDS = [
  { num: '01', icon: '◈', title: 'Pool USDC',
    desc: 'Your group deposits USDC into a shared smart contract on-chain. Balances are transparent, withdrawals always open. No one controls the funds — the contract does.' },
  { num: '02', icon: '⬡', title: 'Agent Pays Per Request',
    desc: 'The SharedMind agent (SharedMind agent) receives your prompt, routes to the cheapest capable AI model, signs a micropayment, and delivers your response. Every step attested on-chain.' },
  { num: '03', icon: '◎', title: 'Earn From Your Knowledge',
    desc: "Your group's attested research becomes a queryable x402 API. External agents pay USDC to access your expertise. Revenue splits back to members weighted by reputation score." },
];

export default function LandingHow() {
  return (
    <section id="how" className="relative z-[2] py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="lp-reveal mb-16">
          <p className="section-label mb-3">How It Works</p>
          <h2 className="font-display font-bold text-chalk leading-[0.95] tracking-tight mb-4"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Three steps.<br />One protocol.
          </h2>
          <p className="font-body text-[16px] text-stone leading-[1.7] max-w-[480px]">
            No flat fees. No trust required. Every action is settled on-chain with full auditability.
          </p>
        </div>

        {/* Cards — use .surface like the app */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px lp-reveal" style={{ background: 'var(--wire)' }}>
          {CARDS.map(c => (
            <div key={c.num} className="surface p-8 hover:bg-carbon transition-colors group" style={{ borderRadius: 0, border: 'none' }}>
              <span className="font-mono text-[9px] text-phosphor tracking-[0.18em] uppercase mb-5 block">{c.num}</span>
              <span className="font-mono text-[20px] text-phosphor mb-4 block group-hover:scale-110 transition-transform inline-block">{c.icon}</span>
              <div className="font-display font-bold text-[16px] text-chalk mb-3">{c.title}</div>
              <p className="font-body text-[13px] text-stone leading-[1.7]">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
