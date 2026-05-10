import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal — not pure black, has warmth
        void:    '#080c0a',
        ink:     '#0d1210',
        carbon:  '#131a16',
        slate:   '#1c2620',
        mist:    '#243029',

        // Borders
        wire:    '#ffffff0a',
        'wire-md':'#ffffff14',
        'wire-hi':'#ffffff22',

        // Text
        chalk:   '#e8ede9',
        stone:   '#7a8c80',
        ash:     '#3d4d42',

        // Primary — phosphor green
        phosphor:    '#00e87a',
        'phosphor-dim':'#00e87a22',
        'phosphor-border':'#00e87a35',
        'phosphor-glow':'rgba(0,232,122,0.15)',

        // Money — amber gold
        gold:        '#f0b429',
        'gold-dim':  '#f0b42918',
        'gold-border':'#f0b42930',

        // Chain — electric blue
        signal:      '#3b9eff',
        'signal-dim':'#3b9eff18',
        'signal-border':'#3b9eff30',

        // Danger
        ember:       '#ff6b4a',
        'ember-dim': '#ff6b4a18',
      },
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        mono:    ['"Space Mono"', 'ui-monospace', 'monospace'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        xs:    ['0.72rem', { lineHeight: '1.1rem', letterSpacing: '0.04em' }],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      boxShadow: {
        'panel':    '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 12px rgba(0,0,0,0.5)',
        'phosphor': '0 0 0 1px rgba(0,232,122,0.3), 0 0 20px rgba(0,232,122,0.12)',
        'gold':     '0 0 0 1px rgba(240,180,41,0.3), 0 0 16px rgba(240,180,41,0.1)',
        'signal':   '0 0 0 1px rgba(59,158,255,0.3), 0 0 16px rgba(59,158,255,0.1)',
        'glow-sm':  '0 0 30px rgba(0,232,122,0.08)',
      },
      animation: {
        'blink':      'blink 1.2s step-end infinite',
        'scan':       'scan 4s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'ticker':     'ticker 0.3s ease-out',
        'enter':      'enter 0.4s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
        ticker: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        enter: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
