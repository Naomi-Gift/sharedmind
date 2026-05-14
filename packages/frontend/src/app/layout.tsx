import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

export const metadata: Metadata = {
  title: 'SharedMind — Group Intelligence Protocol',
  description: 'Pool AI usage on-chain. Build collective intelligence. Sell it to the world.',
  openGraph: {
    title: 'SharedMind — Group Intelligence Protocol',
    description: 'Pool USDC. Build shared AI knowledge on-chain. Earn when others query your expertise.',
    type: 'website',
    siteName: 'SharedMind',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharedMind',
    description: 'Pool USDC. Build shared AI knowledge on-chain. Earn when others query your expertise.',
  },
  keywords: ['AI', 'DeFi', 'on-chain', 'group intelligence', 'USDC', 'micropayments'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
