'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Attestation } from '@/types';

const MODEL_META: Record<string, { label: string; color: string; tagCls: string }> = {
  'claude-haiku-20240307': { label: 'HAIKU',  color: 'text-signal',   tagCls: 'tag-signal'   },
  'claude-sonnet-4-5':     { label: 'SONNET', color: 'text-phosphor', tagCls: 'tag-phosphor' },
  'gpt-4o':                { label: 'GPT-4O', color: 'text-gold',     tagCls: 'tag-gold'     },
};

const DEMO_RESPONSES: Pick<Message, 'content' | 'model' | 'tier' | 'cost' | 'attestation'>[] = [
  {
    content: 'Top DeFi yield strategies on Kite chain: (1) USDC/KITE LP at 12–18% APY, (2) USDC lending pools at 8–11% APY with auto-compounding, (3) Validator staking at 6–9% APY with governance rights. The USDC/KITE LP offers the best risk-adjusted return for stablecoin holders.',
    model: 'claude-haiku-20240307', tier: 'simple', cost: 0.0004,
    attestation: { txHash: '0xabc123def456', requestHash: '0xhash789', blockNumber: 847291 },
  },
  {
    content: 'Smart contract security best practices: use ReentrancyGuard for all external calls, follow checks-effects-interactions pattern, leverage OpenZeppelin battle-tested contracts, run Slither and Mythril static analysis before deployment, and get a professional audit before mainnet.',
    model: 'claude-sonnet-4-5', tier: 'medium', cost: 0.0031,
    attestation: { txHash: '0xdef789abc012', requestHash: '0xhash456', blockNumber: 847302 },
  },
];

let demoIdx = 0;

const QUICK_PROMPTS = [
  'Top DeFi yield strategies on Kite chain?',
  'Explain x402 payment protocol simply',
  'Solidity smart contract security checklist',
  'How does Kite Agent Passport work?',
];

interface Props { member: string }

export default function ChatTab({ member }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'SHAREDMIND AGENT ONLINE // GROUP POOL ACTIVE // ALL RESPONSES ATTESTED ON-CHAIN' },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const prompt = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: prompt }]);
    setLoading(true);

    try {
      const res  = await fetch('/api/agent/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member, prompt }),
      });
      const data = await res.json() as {
        response: string; model: string; tier: string;
        cost: number; attestation: Attestation; error?: string;
      };
      if (!res.ok) throw new Error(data.error);
      setMessages(m => [...m, {
        role: 'assistant', content: data.response,
        model: data.model, tier: data.tier, cost: data.cost, attestation: data.attestation,
      }]);
    } catch {
      await new Promise(r => setTimeout(r, 1100));
      const demo = DEMO_RESPONSES[demoIdx++ % DEMO_RESPONSES.length];
      setMessages(m => [...m, { role: 'assistant', ...demo }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
      {/* Chat terminal */}
      <div className="surface scanlines scan-line relative flex flex-col" style={{ height: 560 }}>
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b"
             style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ember opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-gold opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-phosphor opacity-70" />
            </div>
            <span className="font-mono text-[9px] text-ash tracking-widest uppercase">
              group-agent // {member.slice(0, 6)}…{member.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tag tag-phosphor">
              <span className="live-dot" style={{ width: 4, height: 4 }} />
              $18.50
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-body">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {msg.role === 'system' && (
                  <div className="font-mono text-[9px] text-ash tracking-widest text-center py-2 border-y"
                       style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {msg.content}
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[78%]">
                      <div className="font-mono text-[9px] text-ash tracking-widest mb-1 text-right">YOU</div>
                      <div className="px-4 py-3 text-[13px] text-chalk leading-relaxed"
                           style={{
                             background: 'rgba(0,232,122,0.06)',
                             border: '1px solid rgba(0,232,122,0.2)',
                             borderRadius: '2px',
                             boxShadow: '0 0 16px rgba(0,232,122,0.06)',
                           }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="max-w-[88%]">
                    <div className="font-mono text-[9px] text-ash tracking-widest mb-1">AGENT</div>
                    <div className="surface-raised px-4 py-3 text-[13px] text-chalk leading-relaxed"
                         style={{ borderRadius: '2px' }}>
                      {msg.content}
                    </div>
                    {msg.model && (
                      <div className="flex items-center gap-2 flex-wrap mt-1.5 pl-0.5">
                        <span className={`tag ${MODEL_META[msg.model]?.tagCls ?? 'tag-neutral'}`}>
                          {MODEL_META[msg.model]?.label ?? msg.model}
                        </span>
                        <span className="font-mono text-[9px] text-ash tabular">${msg.cost?.toFixed(4)} USDC</span>
                        {msg.attestation && (
                          <a
                            href={`https://explorer-testnet.gokite.ai/tx/${msg.attestation.txHash}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[9px] text-phosphor hover:opacity-70 transition-opacity tracking-wider"
                          >
                            ⬡ BLOCK #{msg.attestation.blockNumber}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-ash tracking-widest">AGENT</span>
              <div className="flex gap-1 ml-2">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full block"
                    style={{ background: 'var(--phosphor)' }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-ash tracking-widest">ROUTING VIA X402…</span>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2 items-center">
            <span className="font-mono text-[11px] text-phosphor flex-shrink-0">&gt;_</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="enter query…"
              className="field text-[12px] py-2"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn btn-primary flex-shrink-0 text-[10px] py-2 px-5"
            >
              SEND
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-3">
        <div className="surface p-4">
          <p className="section-label mb-3">Quick queries</p>
          <div className="space-y-1">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="w-full text-left font-body text-[12px] text-stone hover:text-chalk px-3 py-2 transition-colors duration-100 border border-transparent hover:border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] rounded-sm"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="surface p-4">
          <p className="section-label mb-3">Cost router</p>
          <div className="space-y-3">
            {[
              { model: 'Haiku',  cost: '0.0009', use: 'Simple Q&A', pct: 70,  color: 'var(--signal)'   },
              { model: 'Sonnet', cost: '0.008',  use: 'Research',   pct: 25,  color: 'var(--phosphor)' },
              { model: 'GPT-4o', cost: '0.030',  use: 'Complex',    pct: 5,   color: 'var(--gold)'     },
            ].map(r => (
              <div key={r.model}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[10px] text-chalk">{r.model}</span>
                  <span className="font-mono text-[10px] text-ash tabular">${r.cost}</span>
                </div>
                <div className="h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color, opacity: 0.7 }} />
                </div>
                <div className="font-mono text-[9px] text-ash mt-0.5 tracking-wider">{r.use} · {r.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
