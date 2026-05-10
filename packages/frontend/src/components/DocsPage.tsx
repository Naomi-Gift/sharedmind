'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DocsContent from './DocsContent';

// ─── Nav structure ────────────────────────────────────────────────────
const NAV = [
  {
    group: 'Getting Started',
    items: [
      { id: 'overview',     label: 'Overview'         },
      { id: 'how-it-works', label: 'How It Works'     },
    ],
  },
  {
    group: 'Groups',
    items: [
      { id: 'create-group', label: 'Create a Group'   },
      { id: 'join-group',   label: 'Join a Group'     },
      { id: 'group-chat',   label: 'Group Chat'       },
      { id: 'streaks',      label: 'Streaks & Badges' },
    ],
  },
  {
    group: 'Pool & Payments',
    items: [
      { id: 'pool',         label: 'Group Pool'        },
      { id: 'ai-agent',     label: 'AI Agent'          },
      { id: 'x402',         label: 'x402 Protocol'     },
      { id: 'earn',         label: 'Earn from Queries' },
    ],
  },
];

export default function DocsPage() {
  const [active, setActive] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  // Highlight active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b h-[52px] flex items-center px-6 justify-between"
              style={{ background: 'rgba(8,12,10,0.92)', borderColor: 'var(--wire)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
                    stroke="#00e87a" strokeWidth="1" fill="rgba(0,232,122,0.06)" />
              <circle cx="11" cy="11" r="2.5" fill="#00e87a" />
            </svg>
            <span className="font-display font-bold text-[14px] tracking-tight text-chalk group-hover:text-phosphor transition-colors">
              SHARED<span className="text-phosphor">MIND</span>
            </span>
          </Link>
          <span className="text-ash font-mono text-[9px]">/</span>
          <span className="font-mono text-[11px] text-stone">Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app" className="btn btn-primary text-[10px] py-1.5 px-4">Launch App ↗</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto py-8 pr-4 border-r"
               style={{ borderColor: 'var(--wire)' }}>
          {NAV.map(group => (
            <div key={group.group} className="mb-6">
              <p className="section-label mb-2 px-3">{group.group}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-sm font-body text-[12px] transition-colors ${
                    active === item.id
                      ? 'text-phosphor bg-[rgba(0,232,122,0.06)]'
                      : 'text-stone hover:text-chalk'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main ref={contentRef} className="flex-1 min-w-0 px-8 py-10 max-w-3xl">
          <DocsContent />
        </main>
      </div>
    </div>
  );
}
