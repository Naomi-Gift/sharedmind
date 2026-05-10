'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  address: string | null;
  chainId: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

const INITIAL: WalletState = {
  address: null, chainId: null,
  connected: false, connecting: false, error: null,
};

// Persist connection across page loads
const STORAGE_KEY = 'sm_wallet';

function getEthereum() {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on: (event: string, handler: (...args: unknown[]) => void) => void; removeListener: (event: string, handler: (...args: unknown[]) => void) => void } }).ethereum ?? null;
}

const KITE_CHAIN_ID = process.env.NEXT_PUBLIC_KITE_CHAIN_ID ?? '0x940'; // 2368 in hex

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL);

  // Restore from storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { address, chainId } = JSON.parse(saved) as { address: string; chainId: string };
        if (address) setState(s => ({ ...s, address, chainId, connected: true }));
      } catch { /* ignore */ }
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;

    const onAccounts = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) {
        setState(INITIAL);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setState(s => ({ ...s, address: list[0], connected: true }));
      }
    };
    const onChain = (chainId: unknown) => {
      setState(s => ({ ...s, chainId: chainId as string }));
    };

    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);
    return () => {
      eth.removeListener('accountsChanged', onAccounts);
      eth.removeListener('chainChanged', onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      setState(s => ({ ...s, error: 'No wallet detected. Install MetaMask.' }));
      return null;
    }
    setState(s => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      const chainId  = await eth.request({ method: 'eth_chainId' }) as string;

      // Prompt switch to Kite chain if on wrong network
      if (chainId !== KITE_CHAIN_ID) {
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: KITE_CHAIN_ID }],
          });
        } catch {
          // Chain not added yet — add it
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId:         KITE_CHAIN_ID,
              chainName:       'Kite Chain',
              nativeCurrency:  { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls:         [process.env.NEXT_PUBLIC_KITE_RPC_URL ?? 'https://rpc-testnet.gokite.ai'],
              blockExplorerUrls: ['https://explorer-testnet.gokite.ai'],
            }],
          });
        }
      }

      const finalChainId = await eth.request({ method: 'eth_chainId' }) as string;
      const address  = accounts[0];
      setState({ address, chainId: finalChainId, connected: true, connecting: false, error: null });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chainId: finalChainId }));
      return address;
    } catch (err) {
      const msg = (err as { message?: string }).message ?? 'Connection rejected';
      setState(s => ({ ...s, connecting: false, error: msg }));
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(INITIAL);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { ...state, connect, disconnect };
}
