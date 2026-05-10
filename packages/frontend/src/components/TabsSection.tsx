'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletCtx } from '@/context/WalletContext';
import ChatTab from './ChatTab';
import PoolTab from './PoolTab';
import AttestationsTab from './AttestationsTab';
import EarnTab from './EarnTab';
import StreaksTab from './StreaksTab';
import GroupChat from './GroupChat';
import GroupInvite from './GroupInvite';

type TabId = 'chat' | 'group' | 'pool' | 'attestations' | 'earn' | 'streaks';

const TABS: { id: TabId; label: string; code: string; badge?: string }[] = [
  { id: 'chat',         label: 'AI Chat',      code: 'CMD' },
  { id: 'group',        label: 'Group',        code: 'GRP', badge: '3' },
  { id: 'pool',         label: 'Pool',         code: 'POL' },
  { id: 'attestations', label: 'Attestations', code: 'ATT' },
  { id: 'earn',         label: 'Earn',         code: 'ERN' },
  { id: 'streaks',      label: 'Streaks',      code: '🔥'  },
];

const GROUP_ID    = 'defi-alpha';

export default function TabsSection() {
  const { address } = useWalletCtx();
  const member = address ?? '0x0000000000000000000000000000000000000000';
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [groupView, setGroupView] = useState<'chat' | 'invite'>('chat');

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      {/* Tab bar */}
      <div className="flex items-end gap-0 mb-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-2 px-4 py-3 transition-all duration-150"
          >
            <span className={`font-mono text-[9px] tracking-widest transition-colors ${activeTab === tab.id ? 'text-phosphor' : 'text-ash'}`}>
              {tab.code}
            </span>
            <span className={`font-body text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'text-chalk' : 'text-stone hover:text-chalk'}`}>
              {tab.label}
            </span>
            {tab.badge && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(0,232,122,0.12)', color: 'var(--phosphor)', border: '1px solid rgba(0,232,122,0.2)' }}>
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-line"
                className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                style={{ background: 'var(--phosphor)', boxShadow: '0 0 8px rgba(0,232,122,0.6)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-3 pr-1 font-mono text-[9px] text-ash tracking-widest">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      {/* Content */}
      <div className="pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'chat'         && <ChatTab member={member} />}
            {activeTab === 'pool'         && <PoolTab />}
            {activeTab === 'attestations' && <AttestationsTab />}
            {activeTab === 'earn'         && <EarnTab />}
            {activeTab === 'streaks'      && <StreaksTab />}

            {activeTab === 'group' && (
              <div className="space-y-4">
                {/* Sub-nav */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGroupView('chat')}
                    className={`font-mono text-[10px] tracking-widest px-4 py-2 transition-all ${groupView === 'chat' ? 'text-chalk border-b border-phosphor' : 'text-ash hover:text-stone'}`}
                  >
                    GROUP CHAT
                  </button>
                  <button
                    onClick={() => setGroupView('invite')}
                    className={`font-mono text-[10px] tracking-widest px-4 py-2 transition-all ${groupView === 'invite' ? 'text-chalk border-b border-phosphor' : 'text-ash hover:text-stone'}`}
                  >
                    INVITE / JOIN
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {groupView === 'chat' && (
                    <motion.div key="gchat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GroupChat currentMember={{ address: member, name: address ? `${address.slice(0,6)}…${address.slice(-4)}` : 'You', initials: 'ME' }} />
                    </motion.div>
                  )}
                  {groupView === 'invite' && (
                    <motion.div key="ginvite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GroupInvite groupId={GROUP_ID} onJoined={() => setGroupView('chat')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
