export default function LandingEarnFeature() {
  const steps = [
    { icon: '🧠', label: 'Group researches' },
    { icon: '⬡',  label: 'Attested on Kite' },
    { icon: '🌐', label: 'Listed as x402 API' },
    { icon: '◎',  label: 'USDC flows in' },
  ];

  return (
    <section className="relative z-[2] py-20 px-6">
      <div className="max-w-5xl mx-auto lp-reveal">
        {/* Card uses .surface + .bracketed like the app */}
        <div className="surface bracketed p-14 relative overflow-hidden"
             style={{ borderColor: 'rgba(0,232,122,0.15)', background: 'linear-gradient(135deg, rgba(0,232,122,0.04), rgba(59,158,255,0.02))' }}>
          {/* Ambient glow */}
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(0,232,122,0.08), transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <div className="relative z-10">
            <span className="tag tag-phosphor mb-5 inline-flex">Group Intelligence</span>
            <h2 className="font-display font-bold text-chalk leading-[0.95] tracking-tight mb-4"
                style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              YOUR GROUP IS<br />
              <span className="glow-text">AN ECONOMY.</span>
            </h2>
            <p className="font-body text-[16px] text-stone leading-[1.7] max-w-[520px] mb-8">
              Every attested research session builds a shared knowledge corpus on-chain.
              List it as a paid API. Other agents — trading bots, research tools, competing groups
              — pay USDC to query your expertise.
            </p>

            {/* Flow steps — same pattern as HeroSection */}
            <div className="surface-inset inline-flex flex-wrap gap-0 overflow-hidden">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-r font-body text-[13px] text-chalk"
                       style={{ borderColor: 'var(--wire)' }}>
                    <span>{s.icon}</span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <span className="font-mono text-[10px] text-ash px-1">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
