'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GroupMessage {
  id: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: number;
  type: 'text' | 'ai-result' | 'streak';
}

const MEMBER_COLORS: Record<string, string> = {
  DR: 'var(--phosphor)',
  CL: 'var(--signal)',
  MR: 'var(--gold)',
  QT: 'var(--ember)',
};

const SEED: GroupMessage[] = [
  { id: '1', authorName: 'Alex', authorInitials: 'CL', authorColor: 'var(--signal)', content: 'Just ran the audit checklist — looks clean. Slither found 2 low-severity warnings, both false positives.', timestamp: Date.now() - 1800000, type: 'text' },
  { id: '2', authorName: 'Mia', authorInitials: 'MR', authorColor: 'var(--gold)', content: 'Nice. I queried the agent about the reentrancy pattern — it flagged the withdraw function. Worth a second look.', timestamp: Date.now() - 1500000, type: 'text' },
  { id: 'sys1', authorName: '', authorInitials: '', authorColor: '', content: 'Agent query attested on Kite chain — block #847302 · $0.0031 USDC', timestamp: Date.now() - 1490000, type: 'ai-result' },
  { id: '3', authorName: 'Gift', authorInitials: 'DR', authorColor: 'var(--phosphor)', content: 'Good catch. USDC/KITE LP is at 16.2% APY right now. Should we rebalance the pool allocation?', timestamp: Date.now() - 900000, type: 'text' },
  { id: 'streak1', authorName: '', authorInitials: '', authorColor: '', content: '🔥 Group streak: 14 days! All members active today. +2 reputation each.', timestamp: Date.now() - 600000, type: 'streak' },
  { id: '4', authorName: 'Alex', authorInitials: 'CL', authorColor: 'var(--signal)', content: "I'm in for rebalancing. Let's query the agent for current risk-adjusted yield comparison first.", timestamp: Date.now() - 300000, type: 'text' },
];

const INCOMING = [
  { name: 'Alex', initials: 'CL', color: 'var(--signal)', content: 'Running the yield comparison now…' },
  { name: 'Mia', initials: 'MR', color: 'var(--gold)', content: 'Also checking the attestation log for any anomalies.' },
];

interface Props {
  currentMember?: { address: string; name: string; initials: string };
}

function timeLabel(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.round(d / 60000)}m ago`;
  return `${Math.round(d / 3600000)}h ago`;
}

export default function GroupChat({ currentMember }: Props) {
  const me = currentMember ?? { address: '0xDeFi…a1b2', name: 'Gift', initials: 'DR' };
  const [messages, setMessages] = useState<GroupMessage[]>(SEED);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const m = INCOMING[i++ % INCOMING.length];
      setMessages(prev => [...prev, {
        id: String(Date.now()),
        authorName: m.name,
        authorInitials: m.initials,
        authorColor: m.color,
        content: m.content,
        timestamp: Date.now(),
        type: 'text' as const,
      }]);
    }, 22000);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      authorName: me.name,
      authorInitials: me.initials,
      authorColor: MEMBER_COLORS[me.initials] ?? 'var(--phosphor)',
      content: input.trim(),
      timestamp: Date.now(),
      type: 'text' as const,
    }]);
    setInput('');
  };

  return (
    <div className="surface flex flex-col" style={{ height: 520 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: 'var(--ember)' }} />
            <span className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: 'var(--gold)' }} />
            <span className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: 'var(--phosphor)' }} />
          </div>
          <span className="font-mono text-[9px] text-ash tracking-widest uppercase">group-chat // members only</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-[9px] text-stone tracking-widest">3 online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isMe = msg.authorName === me.name;

            if (msg.type === 'ai-result') {
              return (
                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <div className="font-mono text-[9px] text-ash tracking-widest px-3 py-1.5" style={{ borderRadius: 2, border: '1px solid rgba(0,232,122,0.15)', background: 'rgba(0,232,122,0.03)' }}>
                    ⬡ {msg.content}
                  </div>
                </motion.div>
              );
            }

            if (msg.type === 'streak') {
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
                  <div className="font-mono text-[9px] tracking-widest px-3 py-1.5" style={{ borderRadius: 2, color: 'var(--ember)', border: '1px solid rgba(255,107,74,0.25)', background: 'rgba(255,107,74,0.05)' }}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: `${msg.authorColor}15`, border: `1px solid ${msg.authorColor}30`, color: msg.authorColor }}>
                  {msg.authorInitials}
                </div>
                <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    {!isMe && <span className="font-mono text-[9px] tracking-widest" style={{ color: msg.authorColor }}>{msg.authorName}</span>}
                    <span className="font-mono text-[9px] text-ash">{timeLabel(msg.timestamp)}</span>
                    {isMe && <span className="font-mono text-[9px] tracking-widest" style={{ color: 'var(--phosphor)' }}>you</span>}
                  </div>
                  <div className="px-3 py-2.5 font-body text-[13px] text-chalk leading-relaxed" style={{ borderRadius: 2, background: isMe ? 'rgba(0,232,122,0.07)' : 'var(--carbon)', border: isMe ? '1px solid rgba(0,232,122,0.18)' : '1px solid rgba(255,255,255,0.06)' }}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-2 items-center">
          <span className="font-mono text-[11px] flex-shrink-0" style={{ color: 'var(--phosphor)' }}>&gt;_</span>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="message the group…" className="field text-[12px] py-2" />
          <button onClick={send} disabled={!input.trim()} className="btn btn-primary flex-shrink-0 text-[10px] py-2 px-4">SEND</button>
        </div>
      </div>
    </div>
  );
}
