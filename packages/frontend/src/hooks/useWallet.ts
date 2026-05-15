'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  address: string | null;
  chainId: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  wrongNetwork: boolean;
}

const INITIAL: WalletState = {
  address: null, chainId: null,
  connected: false, connecting: false, error: null, wrongNetwork: false,
};

const STORAGE_KEY  = 'sm_wallet';
const KITE_CHAIN_ID = process.env.NEXT_PUBLIC_KITE_CHAIN_ID ?? '0x940';

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getEthereum(): EthProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: EthProvider }).ethereum ?? null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL);

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const { address, chainId } = JSON.parse(saved) as { address: string; chainId: string };
      if (address) {
        setState(s => ({
          ...s,
          address,
          chainId,
          connected: true,
          wrongNetwork: chainId.toLowerCase() !== KITE_CHAIN_ID.toLowerCase(),
        }));
      }
    } catch { /* ignore */ }
  }, []);

  // Listen for MetaMask events
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
      const id = chainId as string;
      setState(s => ({
        ...s,
        chainId: id,
        wrongNetwork: id.toLowerCase() !== KITE_CHAIN_ID.toLowerCase(),
      }));
    };

    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);
    return () => {
      eth.removeListener('accountsChanged', onAccounts);
      eth.removeListener('chainChanged', onChain);
    };
  }, []);

  const connect = useCallback(async (): Promise<string | null> => {
    const eth = getEthereum();
    if (!eth) {
      setState(s => ({ ...s, error: 'No wallet detected. Install MetaMask.' }));
      return null;
    }

    setState(s => ({ ...s, connecting: true, error: null }));

    try {
      // Step 1: request accounts — this is the only required step
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      const chainId  = await eth.request({ method: 'eth_chainId' }) as string;
      const address  = accounts[0];
      const isWrongNetwork = chainId.toLowerCase() !== KITE_CHAIN_ID.toLowerCase();

      setState({
        address,
        chainId,
        connected: true,
        connecting: false,
        error: null,
        wrongNetwork: isWrongNetwork,
      });

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chainId }));

      // Step 2: suggest chain switch in background — don't block connection
      if (isWrongNetwork) {
        switchToKite(eth).catch(() => {/* user declined, that's fine */});
      }

      return address;
    } catch (err) {
      const msg = (err as { message?: string; code?: number }).code === 4001
        ? 'Connection rejected by user'
        : ((err as { message?: string }).message ?? 'Connection failed');
      setState(s => ({ ...s, connecting: false, error: msg }));
      return null;
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    await switchToKite(eth);
  }, []);

  const disconnect = useCallback(() => {
    setState(INITIAL);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { ...state, connect, disconnect, switchNetwork };
}

async function switchToKite(eth: EthProvider): Promise<void> {
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: KITE_CHAIN_ID }],
    });
  } catch (switchErr) {
    // Error 4902 = chain not added yet
    if ((switchErr as { code?: number }).code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId:           KITE_CHAIN_ID,
          chainName:         'Kite Chain',
          nativeCurrency:    { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls:           [process.env.NEXT_PUBLIC_KITE_RPC_URL ?? 'https://rpc-testnet.gokite.ai'],
          blockExplorerUrls: ['https://explorer-testnet.gokite.ai'],
        }],
      });
    }
    // Other errors (user rejected) — silently ignore
  }
}
