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
type GroupView = 'chat' | 'invite';

const TABS: { id: TabId; label: string; code: string; badge?: string }[] = [
  { id: 'chat',         label: 'AI Chat',      code: 'CMD' },
  { id: 'group',        label: 'Group',        code: 'GRP', badge: '3' },
  { id: 'pool',         label: 'Pool',         code: 'POL' },
  { id: 'attestations', label: 'Attestations', code: 'ATT' },
  { id: 'earn',         label: 'Earn',         code: 'ERN' },
  { id: 'streaks',      label: 'Streaks',      code: '🔥'  },
];

const GROUP_VIEWS: { id: GroupView; label: string }[] = [
  { id: 'chat',   label: 'Chat'        },
  { id: 'invite', label: 'Invite / Join' },
];


export default function TabsSection() {
  const { address } = useWalletCtx();
  const member = address ?? '0x0000000000000000000000000000000000000000';
  const [activeTab, setActiveTab]   = useState<TabId>('chat');
  const [groupView, setGroupView]   = useState<GroupView>('chat');

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">

      {/* ── Main tab bar — horizontally scrollable on mobile ── */}
      <div className="relative">
        <div
          className="flex items-end gap-0 border-b overflow-x-auto"
          style={{ borderColor: 'rgba(255,255,255,0.06)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-3 transition-all duration-150 flex-shrink-0"
            >
              <span className={`font-mono text-[9px] tracking-widest transition-colors hidden sm:block ${activeTab === tab.id ? 'text-phosphor' : 'text-ash'}`}>
                {tab.code}
              </span>
              <span className={`font-body text-[13px] font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-chalk' : 'text-stone hover:text-chalk'}`}>
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
          <div className="ml-auto flex items-center gap-2 pb-3 pr-1 font-mono text-[9px] text-ash tracking-widest flex-shrink-0">
            <span className="live-dot" />
            <span className="hidden sm:block">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
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
                {/* Group sub-nav — styled to match main tabs */}
                <div className="flex items-end gap-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {GROUP_VIEWS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setGroupView(v.id)}
                      className="relative flex items-center gap-2 px-4 py-2.5 transition-all duration-150"
                    >
                      <span className={`font-body text-[12px] font-medium transition-colors ${groupView === v.id ? 'text-chalk' : 'text-stone hover:text-chalk'}`}>
                        {v.label}
                      </span>
                      {groupView === v.id && (
                        <motion.div
                          layoutId="group-sub-line"
                          className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                          style={{ background: 'var(--phosphor)', boxShadow: '0 0 6px rgba(0,232,122,0.5)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {groupView === 'chat' && (
                    <motion.div key="gchat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GroupChat currentMember={{
                        address: member,
                        name: address ? `${address.slice(0,6)}…${address.slice(-4)}` : 'You',
                        initials: 'ME',
                      }} />
                    </motion.div>
                  )}
                  {groupView === 'invite' && (
                    <motion.div key="ginvite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GroupInvite onGroupReady={() => setGroupView('chat')} />
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
