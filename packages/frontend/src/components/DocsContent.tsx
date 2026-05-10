'use client';

import { useState } from 'react';

function H1({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h1 id={id} data-section className="font-display font-bold text-chalk leading-tight tracking-tight mb-4 scroll-mt-20"
        style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
      {children}
    </h1>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} data-section className="font-display font-bold text-chalk text-[22px] mt-12 mb-4 scroll-mt-20 border-b pb-2"
        style={{ borderColor: 'var(--wire)' }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-bold text-chalk text-[16px] mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[14px] text-stone leading-[1.75] mb-4">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] px-1.5 py-0.5 rounded-sm text-phosphor"
          style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.15)' }}>
      {children}
    </code>
  );
}

function Pre({ children, lang = '' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group mb-5">
      <div className="surface-inset overflow-x-auto">
        {lang && (
          <div className="px-4 pt-3 pb-1 font-mono text-[9px] text-ash tracking-widest uppercase border-b"
               style={{ borderColor: 'var(--wire)' }}>
            {lang}
          </div>
        )}
        <pre className="px-4 py-3 font-mono text-[12px] text-chalk leading-relaxed whitespace-pre overflow-x-auto">
          {children}
        </pre>
      </div>
      <button
        onClick={copy}
        className="absolute top-2 right-2 font-mono text-[9px] text-ash tracking-widest px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-chalk"
        style={{ background: 'var(--carbon)', borderRadius: 2, border: '1px solid var(--wire-md)' }}
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}

function Note({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warn' | 'tip' }) {
  const styles = {
    info: { border: 'rgba(59,158,255,0.25)', bg: 'rgba(59,158,255,0.05)', color: 'var(--signal)', icon: 'ℹ' },
    warn: { border: 'rgba(255,107,74,0.25)',  bg: 'rgba(255,107,74,0.05)',  color: 'var(--ember)',  icon: '⚠' },
    tip:  { border: 'rgba(0,232,122,0.25)',   bg: 'rgba(0,232,122,0.05)',   color: 'var(--phosphor)', icon: '◈' },
  }[type];
  return (
    <div className="flex gap-3 px-4 py-3 mb-5 rounded-sm" style={{ border: `1px solid ${styles.border}`, background: styles.bg }}>
      <span className="font-mono text-[13px] flex-shrink-0 mt-0.5" style={{ color: styles.color }}>{styles.icon}</span>
      <div className="font-body text-[13px] text-stone leading-relaxed">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--wire-md)' }}>
            {headers.map(h => (
              <th key={h} className="text-left px-3 py-2 font-mono text-[10px] text-ash tracking-widest uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b" style={{ borderColor: 'var(--wire)' }}>
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2.5 font-body text-stone ${j === 0 ? 'font-mono text-[12px] text-chalk' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsContent() {
  return (
    <div>

      {/* OVERVIEW */}
      <H1 id="overview">SharedMind Documentation</H1>
      <P>
        SharedMind is a group intelligence protocol. A group of people pools USDC into a shared smart contract.
        Their shared AI agent pays for AI API calls via x402 micropayments. Every response is attested on-chain.
        Over time, that knowledge becomes a queryable API — other agents pay USDC to access it, and revenue
        flows back to members proportional to their reputation score.
      </P>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pool USDC',         icon: '◈', desc: 'Shared smart contract' },
          { label: 'AI via x402',       icon: '⬡', desc: 'Pay per request'       },
          { label: 'Attest on-chain',   icon: '◎', desc: 'Immutable records'     },
          { label: 'Earn from queries', icon: '▸', desc: 'Revenue splits by rep' },
        ].map(s => (
          <div key={s.label} className="surface p-3 text-center">
            <div className="font-mono text-[18px] text-phosphor mb-1">{s.icon}</div>
            <div className="font-body text-[12px] font-semibold text-chalk">{s.label}</div>
            <div className="font-mono text-[9px] text-ash mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <H2 id="how-it-works">How It Works</H2>
      <P>The full value loop in three layers:</P>
      <Table
        headers={['Layer', 'What happens']}
        rows={[
          ['1. Pool',   "Members deposit USDC into GroupPool.sol on Kite chain. The contract tracks each member's balance and reputation score."],
          ['2. Agent',  "The SharedMind agent receives prompts, routes to the cheapest capable AI model, signs an x402 micropayment, delivers the response, and debits the member's balance on-chain."],
          ['3. Market', "The group's attested prompt/response pairs form a knowledge corpus. External agents pay USDC per query. Revenue is split to members by reputation weight."],
        ]}
      />

      {/* CREATE GROUP */}
      <H2 id="create-group">Create a Group</H2>
      <P>Groups are created through the app UI or directly via the smart contract.</P>

      <H3>Via the app</H3>
      <P>Go to <Code>/app</Code> → Group tab → Create a Group. Fill in the name, focus area, description, and initial USDC deposit. The app deploys your group agent and generates an invite code.</P>

      <H3>Via the contract</H3>
      <Pre lang="solidity">{`// Deploy GroupPool.sol with:
// _usdc: USDC contract address on Kite chain
// _agent: your backend wallet address
GroupPool pool = new GroupPool(usdcAddress, agentAddress);

// Add yourself as the first member
pool.addMember(msg.sender);

// Invite others
pool.inviteMember(friendAddress);`}</Pre>

      <Note type="info">The contract owner controls membership. Members must be invited before they can call <Code>join()</Code>.</Note>

      {/* JOIN GROUP */}
      <H2 id="join-group">Join a Group</H2>
      <P>To join an existing group you need an invite code or link from the group admin.</P>
      <Table
        headers={['Method', 'How']}
        rows={[
          ['Invite code',  'Admin shares a code (e.g. DEFIALPHA7X2K). Enter it in Group → Join with Code.'],
          ['Invite link',  'Admin shares https://sharedmind.app/join/{groupId}. Click to pre-fill the join form.'],
          ['Wallet invite','Admin enters your wallet address in the app. You receive an on-chain invitation.'],
          ['Browse',       'Public groups appear in Group → Browse Open Groups. Click Request to join.'],
        ]}
      />
      <P>After submitting a join request, the group admin approves it on-chain. You then call <Code>join()</Code> to activate your membership.</P>

      {/* GROUP CHAT */}
      <H2 id="group-chat">Group Chat</H2>
      <P>Every group has a private chat room visible only to active members. Messages are ephemeral and local to the session. AI query results and streak milestones appear as system messages in the chat.</P>
      <Note type="warn">Group chat is currently in-memory. Production would use a WebSocket server or a decentralized messaging layer like XMTP.</Note>

      {/* STREAKS */}
      <H2 id="streaks">Streaks & Badges</H2>
      <P>Streaks track daily group activity. The group streak increments when all members are active on the same day.</P>

      <H3>Streak mechanics</H3>
      <Table
        headers={['Concept', 'Description']}
        rows={[
          ['Group streak',      'Increments when every member sends at least one prompt that day.'],
          ['Individual streak', 'Each member has their own streak. Falling behind shows a "needs to check in" warning.'],
          ['Streak Shield',     'Protects the group streak for one missed day. Earned at 1 shield per 7 days of activity.'],
          ['Milestones',        '7, 14, 21, 30, 60 days — each unlocks a USDC reputation bonus and a badge.'],
        ]}
      />

      <H3>Badges</H3>
      <Table
        headers={['Badge', 'Requirement']}
        rows={[
          ['🔥 Week Warrior', '7-day streak'],
          ['🧠 Deep Thinker', '50+ prompts sent'],
          ['◈ Pool Anchor',   'First to deposit USDC'],
          ['🏆 Legend',       '21-day group streak'],
          ['⚡ Rainmaker',    'Earn $5 from API queries'],
          ['🌐 API Baron',    '100 external queries sold'],
          ['◎ The Squad',     'All members active 30 days'],
          ['👑 Protocol OG',  '60-day group streak'],
        ]}
      />

      {/* POOL */}
      <H2 id="pool">Group Pool</H2>
      <P>The pool is a USDC balance held in the GroupPool smart contract. Each member has their own balance within the shared contract.</P>
      <Table
        headers={['Action', 'Who', 'Description']}
        rows={[
          ['deposit(amount)',  'Member', 'Transfer USDC from your wallet into your pool balance.'],
          ['withdraw(amount)', 'Member', 'Withdraw any amount up to your balance at any time.'],
          ['debit()',          'Agent',  'Called automatically after each AI request. Deducts cost from member balance.'],
          ['creditRevenue()',  'Agent',  'Called after an external query payment. Splits USDC to members by reputation.'],
        ]}
      />
      <Note type="tip">Reputation score determines your share of incoming revenue. Higher rep = larger cut. Rep increases with usage, deposits, and when your knowledge is queried externally.</Note>

      {/* AI AGENT */}
      <H2 id="ai-agent">AI Agent</H2>
      <P>The SharedMind agent routes prompts to the cheapest capable model using a cost router.</P>
      <Table
        headers={['Model', 'Cost / 1k tokens', 'Used for']}
        rows={[
          ['Claude Haiku',  '$0.00025', 'Simple Q&A, short lookups — ~70% of requests'],
          ['Claude Sonnet', '$0.003',   'Research, analysis, writing — ~25% of requests'],
          ['GPT-4o',        '$0.005',   'Complex reasoning, code, creative — ~5% of requests'],
        ]}
      />

      {/* X402 */}
      <H2 id="x402">x402 Protocol</H2>
      <P>x402 is an HTTP-native micropayment protocol. When a client requests a paid resource, the server returns <Code>402 Payment Required</Code> with payment details. The client signs a payment header and retries.</P>
      <Pre lang="http">{`# 1. Request without payment → 402
POST /api/query  →  402 { price: 0.12, currency: "USDC", scheme: "x402" }

# 2. Sign and retry
POST /api/query
X-Payment: <base64-signed-payload>
→ 200 { answer: "...", paidBy: "0x...", amountPaid: 0.12 }`}</Pre>

      {/* EARN */}
      <H2 id="earn">Earn from Queries</H2>
      <P>Every attested prompt/response pair is stored in the group's knowledge index. External agents can query this index by paying USDC via x402.</P>
      <P>Revenue is split proportionally by reputation:</P>
      <Pre lang="solidity">{`uint256 share = (amount * members[m].reputation) / totalReputation;`}</Pre>
      <P>A member with reputation 87 in a group with total reputation 282 receives <Code>87/282 = 30.8%</Code> of each payment.</P>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--wire)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="font-mono text-[10px] text-ash tracking-widest">SHAREDMIND DOCS</p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className="font-mono text-[10px] text-ash hover:text-chalk transition-colors tracking-widest uppercase">GitHub</a>
            <a href="https://gokite.ai" target="_blank" rel="noopener noreferrer"
               className="font-mono text-[10px] text-ash hover:text-chalk transition-colors tracking-widest uppercase">Kite Chain</a>
          </div>
        </div>
      </div>

    </div>
  );
}
