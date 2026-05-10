import Link from 'next/link';

const BEFORE = [
  { title: 'ChatGPT Plus',    label: 'per person / month', val: '$20.00' },
  { title: 'Claude Pro',      label: 'per person / month', val: '$20.00' },
  { title: 'Gemini Advanced', label: 'per person / month', val: '$19.99' },
];
const AFTER = [
  { title: 'All 3 models via API', label: '50 requests / member',    val: '~$1.40' },
  { title: 'Revenue from queries', label: 'external agents paid you', val: '+$0.84' },
];

export default function LandingMoney() {
  return (
    <section id="earn" className="relative z-[2] py-28 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div className="lp-reveal">
          <p className="section-label mb-3">The Economics</p>
          <h2 className="font-display font-bold text-chalk leading-[0.95] tracking-tight mb-4"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Stop paying.<br />Start earning.
          </h2>
          <p className="font-body text-[16px] text-stone leading-[1.7] mb-8 max-w-[440px]">
            Traditional AI subscriptions charge flat fees whether you use them or not.
            SharedMind charges per request — and pays you back when others query your knowledge.
          </p>
          <Link href="/app" className="btn btn-primary text-[11px] py-3 px-7">
            Create a Group →
          </Link>
        </div>

        {/* Right — cost comparison using .surface */}
        <div className="lp-reveal space-y-2">
          <p className="section-label mb-2">Before SharedMind</p>
          {BEFORE.map(r => (
            <div key={r.title} className="surface-raised flex items-center justify-between px-4 py-3">
              <div>
                <div className="font-body text-[13px] font-semibold text-chalk">{r.title}</div>
                <div className="font-mono text-[9px] text-stone tracking-wider">{r.label}</div>
              </div>
              <span className="font-mono text-[16px] font-bold" style={{ color: 'var(--ember)' }}>{r.val}</span>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-2 border-t" style={{ borderColor: 'var(--wire)' }}>
            <span className="font-body text-[12px] text-stone">Monthly total (3 tools)</span>
            <span className="font-mono text-[16px] font-bold" style={{ color: 'var(--ember)' }}>$59.99</span>
          </div>

          <p className="section-label mb-2 mt-5">With SharedMind</p>
          {AFTER.map(r => (
            <div key={r.title} className="surface-raised flex items-center justify-between px-4 py-3"
                 style={{ borderColor: 'rgba(0,232,122,0.15)', background: 'rgba(0,232,122,0.03)' }}>
              <div>
                <div className="font-body text-[13px] font-semibold text-chalk">{r.title}</div>
                <div className="font-mono text-[9px] text-stone tracking-wider">{r.label}</div>
              </div>
              <span className="font-mono text-[16px] font-bold glow-text">{r.val}</span>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-2 border-t" style={{ borderColor: 'rgba(0,232,122,0.15)' }}>
            <span className="font-body text-[12px] text-stone">Net monthly cost</span>
            <span className="font-mono text-[16px] font-bold glow-text">~$0.56</span>
          </div>
        </div>
      </div>
    </section>
  );
}
