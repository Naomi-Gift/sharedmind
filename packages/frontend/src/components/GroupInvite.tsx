'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletCtx } from '@/context/WalletContext';

interface Props {
  onGroupReady: (groupId: string, groupName: string) => void;
}

type View = 'landing' | 'create' | 'creating' | 'create-done' | 'join' | 'join-pending' | 'browse';

const OPEN_GROUPS = [
  { id: 'defi-alpha', name: 'DeFi Alpha',       members: 3, pool: '$47.82', streak: 14, focus: 'DeFi / Yield',       description: 'DeFi researchers & quant traders pooling AI for yield strategies' },
  { id: 'legal-dao',  name: 'Legal DAO',         members: 2, pool: '$22.10', streak: 7,  focus: 'Legal / Web3',       description: 'Crypto lawyers building shared legal knowledge corpus' },
  { id: 'med-ai',     name: 'MedAI Collective',  members: 4, pool: '$61.40', streak: 21, focus: 'Medicine / Research', description: 'Medical researchers using AI to accelerate drug discovery' },
];

const FOCUS_OPTIONS = ['DeFi / Yield','Legal / Web3','Medicine / Research','Trading / Quant','Engineering','Science','Education','Other'];

function generateCode(name: string) {
  return name.toUpperCase().replace(/\s+/g,'').slice(0,8) + Math.random().toString(36).slice(2,6).toUpperCase();
}

export default function GroupInvite({ onGroupReady }: Props) {
  const { address } = useWalletCtx();
  const [view, setView]       = useState<View>('landing');
  const [groupName, setGroupName] = useState('');
  const [focus, setFocus]     = useState('');
  const [description, setDesc] = useState('');
  const [deposit, setDeposit] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createdGroup, setCreated] = useState<{id:string;name:string;code:string;link:string}|null>(null);
  const [copied, setCopied]   = useState(false);
  const [yourName, setYourName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinSent, setJoinSent] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setView('creating');
    await new Promise(r => setTimeout(r, 1400));
    const id   = groupName.toLowerCase().replace(/\s+/g,'-');
    const code = generateCode(groupName);
    setCreated({ id, name: groupName, code, link: `https://sharedmind.app/join/${id}` });
    setView('create-done');
  };

  const handleJoin = async () => {
    if (!yourName.trim() || !inviteCode.trim()) return;
    setJoinSent(true);
    setView('join-pending');
    await new Promise(r => setTimeout(r, 1800));
    onGroupReady(inviteCode.toLowerCase(), yourName);
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface p-5">
      <AnimatePresence mode="wait">

        {/* LANDING */}
        {view === 'landing' && (
          <motion.div key="landing" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <p className="section-label mb-1">Groups</p>
            <p className="font-body text-[13px] text-stone mb-6">Create a new group or join an existing one. Groups pool USDC, share AI access, and build collective knowledge on-chain.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button onClick={() => setView('create')} className="surface-raised p-5 text-left transition-all hover:border-[rgba(0,232,122,0.3)] group" style={{borderRadius:4}}>
                <div className="font-mono text-[22px] mb-3 group-hover:scale-110 transition-transform inline-block" style={{color:'var(--phosphor)'}}>◈</div>
                <div className="font-body text-[14px] font-semibold text-chalk mb-1">Create a Group</div>
                <div className="font-mono text-[9px] text-ash tracking-wider leading-relaxed">Start a new group, set your focus, deposit USDC, invite members</div>
              </button>
              <button onClick={() => setView('join')} className="surface-raised p-5 text-left transition-all hover:border-[rgba(59,158,255,0.3)] group" style={{borderRadius:4}}>
                <div className="font-mono text-[22px] mb-3 group-hover:scale-110 transition-transform inline-block" style={{color:'var(--signal)'}}>⬡</div>
                <div className="font-body text-[14px] font-semibold text-chalk mb-1">Join with Code</div>
                <div className="font-mono text-[9px] text-ash tracking-wider leading-relaxed">Enter an invite code or link from a friend</div>
              </button>
              <button onClick={() => setView('browse')} className="surface-raised p-5 text-left transition-all hover:border-[rgba(240,180,41,0.3)] group" style={{borderRadius:4}}>
                <div className="font-mono text-[22px] mb-3 group-hover:scale-110 transition-transform inline-block" style={{color:'var(--gold)'}}>◎</div>
                <div className="font-body text-[14px] font-semibold text-chalk mb-1">Browse Open Groups</div>
                <div className="font-mono text-[9px] text-ash tracking-wider leading-relaxed">Discover public groups and request to join</div>
              </button>
            </div>

            <div className="surface-inset px-4 py-3 flex items-center gap-6 flex-wrap">
              <div className="font-mono text-[9px] text-ash tracking-widest">NETWORK STATS</div>
              {[{label:'Active Groups',value:'12'},{label:'Total Pool',value:'$847'},{label:'Queries Sold',value:'1,204'}].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-phosphor">{s.value}</span>
                  <span className="font-mono text-[9px] text-ash tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CREATE FORM */}
        {view === 'create' && (
          <motion.div key="create" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <button onClick={() => setView('landing')} className="font-mono text-[9px] text-ash tracking-widest mb-5 hover:text-stone transition-colors flex items-center gap-1">← BACK</button>
            <p className="section-label mb-1">Create a Group</p>
            <p className="font-body text-[13px] text-stone mb-5">Your group gets a shared smart contract, a dedicated AI agent, and a private group chat.</p>

            <div className="space-y-4 mb-5">
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">GROUP NAME *</p>
                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. DeFi Alpha, Legal DAO, Med Collective…" className="field text-[13px] py-2.5" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">FOCUS AREA</p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map(f => (
                    <button key={f} onClick={() => setFocus(f)} className="font-mono text-[9px] tracking-wider px-3 py-1.5 transition-all" style={{borderRadius:2,border:focus===f?'1px solid rgba(0,232,122,0.4)':'1px solid rgba(255,255,255,0.08)',background:focus===f?'rgba(0,232,122,0.08)':'transparent',color:focus===f?'var(--phosphor)':'var(--stone)'}}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">DESCRIPTION</p>
                <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="What does your group research or work on?" rows={2} className="field text-[13px] py-2.5 resize-none" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">INITIAL DEPOSIT (USDC)</p>
                <div className="flex gap-2">
                  <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="e.g. 10" className="field text-[13px] py-2.5" />
                  <div className="flex gap-1">
                    {['5','10','25'].map(v => (
                      <button key={v} onClick={() => setDeposit(v)} className="btn btn-outline text-[9px] px-3 py-2 flex-shrink-0">${v}</button>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-[9px] text-ash tracking-wider mt-1.5">Deposited to your group smart contract. Withdraw anytime.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPublic(p => !p)} className="w-9 h-5 rounded-full transition-all flex-shrink-0 relative" style={{background:isPublic?'var(--phosphor)':'rgba(255,255,255,0.1)'}}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-void transition-all" style={{left:isPublic?'18px':'2px'}} />
                </button>
                <div>
                  <span className="font-body text-[13px] text-chalk">{isPublic?'Public group':'Private group'}</span>
                  <span className="font-mono text-[9px] text-ash tracking-wider ml-2">{isPublic?'— discoverable in Browse':'— invite-only'}</span>
                </div>
              </div>
            </div>

            <button onClick={handleCreate} disabled={!groupName.trim()} className="btn btn-primary w-full py-3 text-[11px]">CREATE GROUP</button>
            <p className="font-mono text-[9px] text-ash tracking-wider mt-2 text-center">Creates a shared smart contract · deploys your group AI agent · all activity attested on-chain</p>
          </motion.div>
        )}

        {/* CREATING */}
        {view === 'creating' && (
          <motion.div key="creating" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
            <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1.2,ease:'linear'}} className="font-mono text-[36px] mx-auto mb-5 w-fit" style={{color:'var(--phosphor)',filter:'drop-shadow(0 0 12px rgba(0,232,122,0.5))'}}>⬡</motion.div>
            <p className="font-mono text-[11px] text-phosphor tracking-widest mb-2">CREATING YOUR GROUP</p>
            <p className="font-body text-[13px] text-stone">Creating smart contract · minting agent passport…</p>
          </motion.div>
        )}

        {/* CREATE DONE */}
        {view === 'create-done' && createdGroup && (
          <motion.div key="create-done" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
            <div className="text-center mb-6">
              <div className="font-mono text-[40px] mb-2" style={{color:'var(--phosphor)',textShadow:'0 0 24px rgba(0,232,122,0.5)'}}>✓</div>
              <p className="font-mono text-[11px] text-phosphor tracking-widest mb-1">GROUP DEPLOYED</p>
              <p className="font-body text-[14px] font-semibold text-chalk">{createdGroup.name}</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">INVITE CODE</p>
                <div className="surface-inset px-4 py-3 text-center">
                  <span className="font-mono text-[24px] font-bold tracking-[0.2em]" style={{color:'var(--phosphor)',textShadow:'0 0 16px rgba(0,232,122,0.4)'}}>{createdGroup.code}</span>
                </div>
                <p className="font-mono text-[9px] text-ash tracking-wider mt-1.5">Share this code with friends — expires in 48 hours</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">INVITE LINK</p>
                <div className="flex gap-2">
                  <div className="surface-inset flex-1 px-3 py-2.5 font-mono text-[10px] text-stone truncate">{createdGroup.link}</div>
                  <button onClick={() => copyLink(createdGroup.link)} className="btn btn-primary text-[9px] px-4 py-2.5 flex-shrink-0">{copied?'✓ COPIED':'COPY'}</button>
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">INVITE BY WALLET</p>
                <div className="flex gap-2">
                  <input placeholder="0x…" className="field text-[12px] py-2.5" />
                  <button className="btn btn-outline text-[9px] px-4 py-2.5 flex-shrink-0">SEND</button>
                </div>
              </div>
            </div>
            <button onClick={() => onGroupReady(createdGroup.id, createdGroup.name)} className="btn btn-primary w-full py-3 text-[11px] mt-5">OPEN GROUP CHAT →</button>
          </motion.div>
        )}

        {/* JOIN FORM */}
        {view === 'join' && (
          <motion.div key="join" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <button onClick={() => setView('landing')} className="font-mono text-[9px] text-ash tracking-widest mb-5 hover:text-stone transition-colors flex items-center gap-1">← BACK</button>
            <p className="section-label mb-1">Join a Group</p>
            <p className="font-body text-[13px] text-stone mb-5">Enter the invite code or link your friend shared with you.</p>
            <div className="space-y-3 mb-5">
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">YOUR NAME</p>
                <input value={yourName} onChange={e => setYourName(e.target.value)} placeholder="How should the group know you?" className="field text-[13px] py-2.5" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">INVITE CODE OR LINK</p>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="DEFIALPHAXXXX  or  https://sharedmind.app/join/…" className="field text-[13px] py-2.5" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-ash tracking-widest mb-2">YOUR WALLET</p>
                <div className="surface-inset px-3 py-2.5 font-mono text-[11px] text-stone">{address ? `${address.slice(0,10)}…${address.slice(-6)}` : 'Connect wallet first'}</div>
              </div>
            </div>
            <button onClick={handleJoin} disabled={!yourName.trim()||!inviteCode.trim()} className="btn btn-primary w-full py-3 text-[11px]">SEND JOIN REQUEST</button>
            <p className="font-mono text-[9px] text-ash tracking-wider mt-2 text-center">Group admin will approve your request on-chain</p>
          </motion.div>
        )}

        {/* JOIN PENDING */}
        {view === 'join-pending' && (
          <motion.div key="join-pending" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="text-center py-12">
            <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1.5,ease:'linear'}} className="font-mono text-[36px] mx-auto mb-5 w-fit" style={{color:'var(--phosphor)'}}>⬡</motion.div>
            <p className="font-mono text-[11px] text-phosphor tracking-widest mb-2">REQUEST SENT</p>
            <p className="font-body text-[13px] text-stone">Waiting for group admin to approve on-chain…</p>
          </motion.div>
        )}

        {/* BROWSE */}
        {view === 'browse' && (
          <motion.div key="browse" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <button onClick={() => setView('landing')} className="font-mono text-[9px] text-ash tracking-widest hover:text-stone transition-colors flex items-center gap-1 mb-1">← BACK</button>
                <p className="section-label">Open Groups</p>
              </div>
              <button onClick={() => setView('create')} className="btn btn-primary text-[9px] py-2 px-4">+ Create New</button>
            </div>
            <div className="space-y-2">
              {OPEN_GROUPS.map(g => (
                <div key={g.id} className="surface-raised p-4 transition-all hover:border-[rgba(255,255,255,0.12)]" style={{borderRadius:4}}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-body text-[14px] font-semibold text-chalk">{g.name}</span>
                        <span className="tag tag-neutral">{g.focus}</span>
                        <span className="font-mono text-[9px] text-ember">🔥 {g.streak}d streak</span>
                      </div>
                      <p className="font-body text-[12px] text-stone mb-2">{g.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[9px] text-ash">{g.members} members</span>
                        <span className="font-mono text-[9px] text-phosphor">{g.pool} pool</span>
                      </div>
                    </div>
                    <button onClick={() => setView('join')} className="btn btn-outline text-[9px] py-2 px-4 flex-shrink-0">Request</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
