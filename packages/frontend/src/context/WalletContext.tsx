'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet, WalletState } from '@/hooks/useWallet';

interface WalletCtx extends WalletState {
  connect: () => Promise<string | null>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <Ctx.Provider value={wallet}>{children}</Ctx.Provider>;
}

export function useWalletCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Return a safe no-op object instead of throwing — prevents crashes
    return {
      address: null, chainId: null, connected: false,
      connecting: false, error: null, wrongNetwork: false,
      connect: async () => null,
      disconnect: () => {},
      switchNetwork: async () => {},
    };
  }
  return ctx;
}
