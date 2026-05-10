'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet, WalletState } from '@/hooks/useWallet';

interface WalletCtx extends WalletState {
  connect: () => Promise<string | null>;
  disconnect: () => void;
}

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <Ctx.Provider value={wallet}>{children}</Ctx.Provider>;
}

export function useWalletCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWalletCtx must be inside WalletProvider');
  return ctx;
}
