'use client';

import { useCallback } from 'react';
import { useWalletCtx } from '@/context/WalletContext';

const POOL_ADDRESS  = process.env.NEXT_PUBLIC_POOL_CONTRACT  ?? '';
const USDC_ADDRESS  = process.env.NEXT_PUBLIC_USDC_CONTRACT  ?? '';

// Minimal ABIs — only what the frontend needs
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const POOL_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getBalance(address member) view returns (uint256)',
  'function getReputation(address member) view returns (uint256)',
  'function isActive(address member) view returns (bool)',
  'function join() external',
  'function addMember(address member) external',
];

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum ?? null;
}

// Encode function call manually (avoids importing ethers on client)
function encodeApprove(spender: string, amount: bigint): string {
  // approve(address,uint256) selector = 0x095ea7b3
  const selector = '095ea7b3';
  const paddedSpender = spender.slice(2).toLowerCase().padStart(64, '0');
  const paddedAmount  = amount.toString(16).padStart(64, '0');
  return `0x${selector}${paddedSpender}${paddedAmount}`;
}

function encodeDeposit(amount: bigint): string {
  // deposit(uint256) selector = 0xb6b55f25
  const selector = 'b6b55f25';
  const paddedAmount = amount.toString(16).padStart(64, '0');
  return `0x${selector}${paddedAmount}`;
}

function encodeBalanceOf(address: string): string {
  // balanceOf(address) selector = 0x70a08231
  const selector = '70a08231';
  const padded = address.slice(2).toLowerCase().padStart(64, '0');
  return `0x${selector}${padded}`;
}

function encodeGetBalance(address: string): string {
  // getBalance(address) selector = 0xf8b2cb4f
  const selector = 'f8b2cb4f';
  const padded = address.slice(2).toLowerCase().padStart(64, '0');
  return `0x${selector}${padded}`;
}

export function useContracts() {
  const { address } = useWalletCtx();

  const getUsdcBalance = useCallback(async (): Promise<number> => {
    const eth = getProvider();
    if (!eth || !address || !USDC_ADDRESS) return 0;
    try {
      const result = await eth.request({
        method: 'eth_call',
        params: [{ to: USDC_ADDRESS, data: encodeBalanceOf(address) }, 'latest'],
      }) as string;
      return parseInt(result, 16) / 1e6;
    } catch { return 0; }
  }, [address]);

  const getPoolBalance = useCallback(async (): Promise<number> => {
    const eth = getProvider();
    if (!eth || !address || !POOL_ADDRESS) return 0;
    try {
      const result = await eth.request({
        method: 'eth_call',
        params: [{ to: POOL_ADDRESS, data: encodeGetBalance(address) }, 'latest'],
      }) as string;
      return parseInt(result, 16) / 1e6;
    } catch { return 0; }
  }, [address]);

  const deposit = useCallback(async (amountUsdc: number): Promise<{ txHash: string }> => {
    const eth = getProvider();
    if (!eth || !address) throw new Error('Wallet not connected');
    if (!POOL_ADDRESS || !USDC_ADDRESS) throw new Error('Contract addresses not configured');

    const amountUnits = BigInt(Math.round(amountUsdc * 1_000_000));

    // Step 1: approve USDC spend
    const approveTx = await eth.request({
      method: 'eth_sendTransaction',
      params: [{
        from: address,
        to:   USDC_ADDRESS,
        data: encodeApprove(POOL_ADDRESS, amountUnits),
      }],
    }) as string;

    // Wait for approval to be mined (poll for receipt)
    await waitForTx(eth, approveTx);

    // Step 2: deposit into pool
    const depositTx = await eth.request({
      method: 'eth_sendTransaction',
      params: [{
        from: address,
        to:   POOL_ADDRESS,
        data: encodeDeposit(amountUnits),
      }],
    }) as string;

    await waitForTx(eth, depositTx);
    return { txHash: depositTx };
  }, [address]);

  return { deposit, getUsdcBalance, getPoolBalance };
}

async function waitForTx(eth: EthereumProvider, txHash: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const receipt = await eth.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      if (receipt) return;
    } catch { /* keep polling */ }
  }
  throw new Error('Transaction not confirmed after 60s');
}
