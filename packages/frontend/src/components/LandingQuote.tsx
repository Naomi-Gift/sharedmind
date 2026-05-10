export default function LandingQuote() {
  return (
    <div className="relative z-[2] py-24 px-6 text-center lp-reveal">
      <h2 className="font-display font-bold text-chalk leading-[1.1] tracking-tight mx-auto mb-6"
          style={{ fontSize: 'clamp(28px, 4.5vw, 54px)', maxWidth: 820 }}>
        &ldquo;The first protocol where a group of humans<br />
        becomes <span className="glow-text">an economic actor</span><br />
        in the agent economy.&rdquo;
      </h2>
      <p className="font-mono text-[9px] text-ash tracking-[0.14em] uppercase">
        — SharedMind · Group Intelligence Protocol
      </p>
    </div>
  );
}
