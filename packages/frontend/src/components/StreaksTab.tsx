'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakData } from '@/types';

const MEMBERS: StreakData[] = [
  {
    address: '0xDeFi…a1b2', name: 'Gift', initials: 'DR', accentColor: 'var(--phosphor)',
    currentStreak: 14, longestStreak: 14, todayActive: true, lastActive: Date.now(),
    weekActivity: [true, true, true, true, true, true, false],
    totalSessions: 47, totalQueries: 203,
  },
  {
    address: '0xLaw…c3d4', name: 'Alex', initials: 'CL', accentColor: 'var(--signal)',
    currentStreak: 14, longestStreak: 21, todayActive: true, lastActive: Date.now() - 3600000,
    weekActivity: [true, true, true, true, true, true, false],
    totalSessions: 52, totalQueries: 241,
  },
  {
    address: '0xMed…e5f6', name: 'Mia', initials: 'MR', accentColor: 'var(--gold)',
    currentStreak: 13, longestStreak: 18, todayActive: false, lastActive: Date.now() - 86400000,
    weekActivity: [true, true, true, true, true, false, false],
    totalSessions: 38, totalQueries: 167,
  },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TODAY_IDX = 5; // Saturday

const BADGES = [
  { icon: '🔥', name: 'Week Warrior',  desc: '7-day streak achieved',       earned: true  },
  { icon: '🧠', name: 'Deep Thinker',  desc: '50+ prompts sent',            earned: true  },
  { icon: '◈',  name: 'Pool Anchor',   desc: 'First to top up pool',        earned: true  },
  { icon: '🏆', name: 'Legend',        desc: '21-day group streak',         earned: false, progress: '7 days away'   },
  { icon: '⚡', name: 'Rainmaker',     desc: 'Earn $5 from API queries',    earned: false, progress: '$4.16 to go'   },
  { icon: '🌐', name: 'API Baron',     desc: '100 external queries sold',   earned: false, progress: '93 to go'      },
  { icon: '◎',  name: 'The Squad',     desc: 'All members active 30 days',  earned: false, progress: '16 days to go' },
  { icon: '👑', name: 'Protocol OG',   desc: '60-day group streak',         earned: false, progress: '46 days away'  },
];

const HEATMAP = [0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 3, 4, 4, 4];

function fireColor(level: number) {
  if (level === 0) return 'rgba(255,255,255,0.04)';
  if (level === 1) return 'rgba(255,107,74,0.2)';
  if (level === 2) return 'rgba(255,107,74,0.45)';
  if (level === 3) return 'rgba(255,107,74,0.7)';
  return 'var(--ember)';
}

export default function StreaksTab() {
  const [streakCount, setStreakCount] = useState(0);
  const [shields, setShields]         = useState(2);
  const [toast, setToast]             = useState('');
  const [particles, setParticles]     = useState<{ id: number; x: number; y: number; color: string; tx: number; ty: number }[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Animate streak counter on mount
  useEffect(() => {
    const target = 14;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setStreakCount(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // Toast on load
  useEffect(() => {
    const t = setTimeout(() => {
      showToast('🔥 14-day streak! Bonus reputation earned.');
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function burst(e: React.MouseEvent) {
    const COLORS = ['var(--ember)', 'var(--gold)', 'var(--phosphor)', 'var(--signal)'];
    const newParticles = Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const dist  = 50 + Math.random() * 70;
      return { id: Date.now() + i, x: e.clientX, y: e.clientY, color: COLORS[i % COLORS.length], tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
    });
    setParticles(p => [...p, ...newParticles]);
    setTimeout(() => setParticles(p => p.filter(x => !newParticles.find(n => n.id === x.id))), 900);
  }

  function useShield() {
    if (shields === 0) return;
    setShields(s => s - 1);
    showToast('🛡️ Streak Shield activated! Group streak protected for today.');
  }

  return (
    <div className="space-y-4">

      {/* ── HERO STREAK CARD ── */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={burst}
        className="surface bracketed relative overflow-hidden cursor-pointer select-none"
        style={{ padding: '40px 36px' }}
      >
        {/* Fire glow bg */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse, rgba(255,107,74,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-start justify-between mb-8">
          <div>
            <p className="section-label mb-3">Group Streak</p>
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono font-bold leading-none tabular"
                style={{ fontSize: 88, background: 'linear-gradient(135deg, var(--ember), var(--gold), #fff176)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(255,107,74,0.5))' }}
              >
                {streakCount}
              </span>
              <span className="font-body text-[20px] text-stone font-semibold">days</span>
            </div>
            <p className="font-body text-[13px] text-stone mt-3">
              Next milestone: <span style={{ color: 'var(--gold)' }} className="font-semibold">🏆 21 days</span>
              {' '}— Unlock <span style={{ color: 'var(--phosphor)' }}>+0.5 USDC reputation bonus</span>
            </p>
          </div>
          <motion.div
            animate={{ rotate: [-4, 4, -4], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ fontSize: 60, filter: 'drop-shadow(0 0 16px rgba(255,107,74,0.7))' }}
          >
            🔥
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10">
          <p className="font-mono text-[9px] text-ash tracking-widest mb-2">ALL 3 MEMBERS ACTIVE TODAY</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-stone whitespace-nowrap">Progress to 21</span>
            <div className="flex-1 h-[5px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '66%' }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full relative"
                style={{ background: 'linear-gradient(90deg, var(--ember), var(--gold), #fff176)', boxShadow: '0 0 10px rgba(255,107,74,0.5)' }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--ember)', transform: 'translate(50%, -50%)' }}
                />
              </motion.div>
            </div>
            <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--gold)' }}>14 / 21</span>
          </div>
        </div>
      </motion.div>

      {/* ── THIS WEEK ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="surface p-5">
        <p className="section-label mb-4">This Week</p>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const done    = i < TODAY_IDX;
            const isToday = i === TODAY_IDX;
            return (
              <div
                key={day}
                className="flex flex-col items-center gap-2 py-3 rounded-sm border transition-all"
                style={{
                  borderColor: done ? 'rgba(255,107,74,0.35)' : isToday ? 'rgba(59,158,255,0.4)' : 'rgba(255,255,255,0.06)',
                  background:  done ? 'rgba(255,107,74,0.05)' : isToday ? 'rgba(59,158,255,0.07)' : 'var(--ink)',
                }}
              >
                <span className="font-mono text-[9px] tracking-widest" style={{ color: done ? 'var(--ember)' : isToday ? 'var(--signal)' : 'var(--ash)' }}>{day}</span>
                <span style={{ fontSize: 18 }}>{done ? '🔥' : isToday ? '⚡' : '·'}</span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: done ? 'var(--gold)' : isToday ? 'var(--signal)' : 'rgba(255,255,255,0.08)', boxShadow: done ? '0 0 5px var(--ember)' : 'none' }} />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── MEMBER STREAKS ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <p className="section-label mb-3">Member Streaks</p>
        <div className="space-y-2">
          {MEMBERS.map((m, i) => {
            const isLeader = i === 0;
            const atRisk   = !m.todayActive;
            return (
              <div
                key={m.address}
                className="surface flex items-center gap-4 px-4 py-4 transition-all hover:translate-x-1"
                style={{ borderColor: isLeader ? 'rgba(255,107,74,0.25)' : atRisk ? 'rgba(255,107,74,0.1)' : 'rgba(255,255,255,0.06)' }}
              >
                {/* Leader bar */}
                {isLeader && <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-r" style={{ background: 'linear-gradient(to bottom, var(--ember), var(--gold))' }} />}

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center font-mono text-[11px] font-bold"
                       style={{ background: `${m.accentColor}15`, border: `1px solid ${m.accentColor}30`, color: m.accentColor }}>
                    {m.initials}
                  </div>
                  {isLeader && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[12px]">👑</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-[13px] font-semibold text-chalk">{m.name}</span>
                    {isLeader && <span className="tag tag-ember" style={{ fontSize: 9 }}>streak leader</span>}
                    {atRisk    && <span className="tag tag-neutral" style={{ fontSize: 9, color: 'var(--ember)' }}>needs to check in!</span>}
                  </div>
                  <div className="font-mono text-[10px] text-ash mb-2">{m.address}</div>
                  {/* Mini week */}
                  <div className="flex gap-1">
                    {m.weekActivity.map((active, j) => (
                      <div key={j} className="w-2.5 h-2.5 rounded-sm transition-all"
                           style={{ background: active ? 'var(--gold)' : j === TODAY_IDX ? 'var(--signal)' : 'rgba(255,255,255,0.06)', boxShadow: active ? '0 0 4px var(--ember)' : 'none' }} />
                    ))}
                  </div>
                </div>

                {/* Streak number */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display font-bold tabular leading-none"
                    style={{
                      fontSize: 28,
                      background: atRisk ? 'none' : `linear-gradient(135deg, ${m.accentColor}, var(--gold))`,
                      WebkitBackgroundClip: atRisk ? 'unset' : 'text',
                      WebkitTextFillColor: atRisk ? 'var(--stone)' : 'transparent',
                      backgroundClip: atRisk ? 'unset' : 'text',
                    }}
                  >
                    {m.currentStreak}
                  </div>
                  <div className="font-mono text-[9px] mt-0.5" style={{ color: atRisk ? 'var(--stone)' : 'var(--ash)' }}>
                    {atRisk ? 'days · at risk' : '🔥 days'}
                  </div>
                  {atRisk && <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--ember)' }}>⚠ check in by midnight</div>}
                  <div className="font-mono text-[9px] text-ash mt-0.5">rep: {m.totalSessions + 40}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── ACTIVITY HEATMAP ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="surface p-5">
        <p className="section-label mb-4">Group Activity — Last 2 Weeks</p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
          {HEATMAP.map((level, i) => (
            <div
              key={i}
              title={level > 0 ? `${level * 8} prompts` : 'No activity'}
              className="aspect-square rounded-sm transition-transform hover:scale-125 cursor-default"
              style={{ background: fireColor(level), boxShadow: level >= 3 ? `0 0 5px rgba(255,107,74,${level * 0.15})` : 'none' }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── GROUP CHALLENGE ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="section-label mb-3">Active Challenge</p>
        <div className="surface p-5 relative overflow-hidden"
             style={{ borderColor: 'rgba(59,158,255,0.2)', background: 'linear-gradient(135deg, rgba(59,158,255,0.05), rgba(0,232,122,0.03))' }}>
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(59,158,255,0.08), transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] text-signal tracking-widest">⚡ GROUP CHALLENGE</span>
            </div>
            <p className="font-body text-[15px] font-semibold text-chalk mb-2">Send 100 prompts as a group this week</p>
            <p className="font-body text-[13px] text-stone mb-4 leading-relaxed">All 3 members contributing earns the group a reputation multiplier. More reputation = bigger share of external API revenue.</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '62%' }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--signal), var(--phosphor))', boxShadow: '0 0 8px rgba(59,158,255,0.4)' }}
                />
              </div>
              <span className="font-mono text-[11px] text-signal whitespace-nowrap">62 / 100</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-[10px] tracking-wider"
                 style={{ borderRadius: 2, borderColor: 'rgba(240,180,41,0.25)', background: 'rgba(240,180,41,0.06)', color: 'var(--gold)' }}>
              🏆 Reward: +0.25 USDC + 2× reputation week
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BADGES ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <p className="section-label mb-3">Badges Earned</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BADGES.map(b => (
            <div
              key={b.name}
              className="surface p-4 text-center transition-all"
              style={{
                opacity: b.earned ? 1 : 0.45,
                filter: b.earned ? 'none' : 'grayscale(0.5)',
                borderColor: b.earned ? 'rgba(255,107,74,0.2)' : 'rgba(255,255,255,0.06)',
                background: b.earned ? 'linear-gradient(135deg, rgba(255,107,74,0.05), rgba(255,179,71,0.03))' : 'var(--ink)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
              <div className="font-body text-[12px] font-semibold text-chalk mb-1">{b.name}</div>
              <div className="font-mono text-[9px] text-stone leading-relaxed">{b.desc}</div>
              {b.earned ? (
                <div className="inline-block mt-2 px-2 py-0.5 font-mono text-[8px] tracking-widest"
                     style={{ borderRadius: 2, background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.25)', color: 'var(--phosphor)' }}>
                  EARNED
                </div>
              ) : (
                <div className="font-mono text-[9px] text-ash mt-2">{b.progress}</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── STREAK SHIELD ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <p className="section-label mb-3">Streak Shield</p>
        <div className="surface p-5 flex items-center justify-between gap-5 flex-wrap">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 32 }}>🛡️</span>
            <div>
              <p className="font-body text-[14px] font-semibold text-chalk mb-1">Streak Shield</p>
              <p className="font-body text-[12px] text-stone leading-relaxed max-w-sm">
                Miss a day? Use a Shield to protect the group streak.
                Earn 1 shield per 7 days of continuous activity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="text-right">
              <div className="font-mono text-[32px] font-bold" style={{ color: '#7dd3fc', textShadow: '0 0 12px rgba(125,211,252,0.4)' }}>{shields}</div>
              <div className="font-mono text-[9px] text-ash tracking-widest">shields left</div>
            </div>
            <button
              onClick={useShield}
              disabled={shields === 0}
              className="btn btn-outline text-[10px] py-2.5 px-5"
              style={{ borderColor: 'rgba(125,211,252,0.25)', color: '#7dd3fc' }}
            >
              USE SHIELD
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 font-body text-[13px] font-semibold text-chalk flex items-center gap-2 whitespace-nowrap"
            style={{ borderRadius: 4, background: 'var(--carbon)', border: '1px solid rgba(255,107,74,0.35)', boxShadow: '0 8px 32px rgba(255,107,74,0.15)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PARTICLES ── */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: p.x, y: p.y, scale: 1 }}
          animate={{ opacity: 0, x: p.x + p.tx, y: p.y + p.ty, scale: 0.2 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="fixed w-2 h-2 rounded-full pointer-events-none z-50"
          style={{ background: p.color, left: 0, top: 0 }}
        />
      ))}
    </div>
  );
}
