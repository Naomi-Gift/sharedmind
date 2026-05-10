import GridBackground from '@/components/GridBackground';
import ParticleField from '@/components/ParticleField';
import AppHeader from '@/components/AppHeader';
import DashboardBanner from '@/components/DashboardBanner';
import TabsSection from '@/components/TabsSection';
import AppGate from '@/components/AppGate';

export default function AppPage() {
  return (
    <AppGate>
      <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--void)', cursor: 'auto' }}>
        <GridBackground />
        <ParticleField />

        <div className="relative z-10">
          <AppHeader />
          <DashboardBanner />
          <TabsSection />

          <footer className="border-t mt-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                  <path d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
                        stroke="#00e87a" strokeWidth="1" fill="rgba(0,232,122,0.06)" />
                  <circle cx="11" cy="11" r="2" fill="#00e87a" />
                </svg>
                <span className="font-display font-bold text-[12px] tracking-tight text-chalk">
                  SHARED<span className="text-phosphor">MIND</span>
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[9px] text-ash tracking-widest">
                <span>SHARED INTELLIGENCE</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                <span>AI PAYMENTS</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                <span>USDC</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                <span>ON-CHAIN</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AppGate>
  );
}
