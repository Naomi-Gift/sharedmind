import Link from 'next/link';

const LINKS = [
  { label: 'GitHub',     href: 'https://github.com',   external: true  },
  { label: 'Docs',       href: '/docs',                external: false },
  { label: 'Kite Chain', href: 'https://gokite.ai',    external: true  },
  { label: 'x402',       href: 'https://x402.org',     external: true  },
];

export default function LandingFooter() {
  return (
    <footer className="relative z-[2] border-t px-6 py-6 flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: 'var(--wire)' }}>
      <div className="flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <path d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
                stroke="#00e87a" strokeWidth="1" fill="rgba(0,232,122,0.06)" />
          <circle cx="11" cy="11" r="2.5" fill="#00e87a" />
        </svg>
        <span className="font-display font-bold text-[13px] tracking-tight text-chalk">
          SHARED<span className="text-phosphor">MIND</span>
        </span>
        <span className="text-ash font-mono text-[9px]">·</span>
        <span className="font-mono text-[9px] text-ash tracking-widest uppercase">Group Intelligence Protocol</span>
      </div>

      <div className="flex gap-6">
        {LINKS.map(link =>
          link.external ? (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
               className="font-mono text-[9px] text-ash tracking-[0.08em] uppercase hover:text-chalk transition-colors">
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href}
                  className="font-mono text-[9px] text-ash tracking-[0.08em] uppercase hover:text-chalk transition-colors">
              {link.label}
            </Link>
          )
        )}
      </div>
    </footer>
  );
}
