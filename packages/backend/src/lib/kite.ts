import { ethers } from 'ethers';
import { createHash } from 'crypto';
import { Attestation, MemberData, PoolStats } from '../types';

const POOL_ABI = [
  'function debit(address member, uint256 cost, string model, bytes32 requestHash) external',
  'function creditRevenue(uint256 amount) external',
  'function boostReputation(address member, uint256 points) external',
  'function getAllMembers() external view returns (address[])',
  'function members(address) external view returns (uint256 balance, uint256 reputation, uint256 totalSpent, uint256 totalEarned, uint256 dailySpent, uint256 dailyLimit, uint256 lastSpendDay, bool active)',
  'function totalPoolBalance() external view returns (uint256)',
  'function totalRevenueEarned() external view returns (uint256)',
  'function queryPrice() external view returns (uint256)',
  'function getBalance(address member) external view returns (uint256)',
];

let _provider: ethers.JsonRpcProvider | null = null;
let _signer:   ethers.Wallet | null = null;
let _pool:     ethers.Contract | null = null;

function isChainConfigured(): boolean {
  return !!(
    process.env.KITE_RPC_URL &&
    process.env.AGENT_PRIVATE_KEY &&
    process.env.POOL_CONTRACT_ADDRESS
  );
}

function getClients() {
  if (!isChainConfigured()) {
    throw new Error('Chain not configured — set KITE_RPC_URL, AGENT_PRIVATE_KEY, POOL_CONTRACT_ADDRESS');
  }
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(process.env.KITE_RPC_URL!);
    _signer   = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, _provider);
    _pool     = new ethers.Contract(process.env.POOL_CONTRACT_ADDRESS!, POOL_ABI, _signer);
  }
  return { provider: _provider, signer: _signer!, pool: _pool! };
}

export async function getMemberBalance(member: string): Promise<bigint> {
  const { pool } = getClients();
  return pool.getBalance(member) as Promise<bigint>;
}

export async function attestAndDebit(params: {
  member: string;
  cost: number;
  model: string;
  prompt: string;
  response: string;
}): Promise<Attestation> {
  const { pool } = getClients();

  const hash = createHash('sha256')
    .update(`${params.member}:${params.prompt}:${params.response}:${Date.now()}`)
    .digest('hex');
  const requestHash = `0x${hash}` as `0x${string}`;
  const costUnits   = BigInt(Math.round(params.cost * 1_000_000));

  const tx      = await pool.debit(params.member, costUnits, params.model, requestHash);
  const receipt = await tx.wait();

  return {
    txHash:      receipt.hash as string,
    requestHash: requestHash as string,
    blockNumber: receipt.blockNumber as number,
  };
}

export async function creditRevenue(amountUsdc: number): Promise<{ txHash: string }> {
  const { pool } = getClients();
  const amountUnits = BigInt(Math.round(amountUsdc * 1_000_000));
  const tx      = await pool.creditRevenue(amountUnits);
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string };
}

export async function boostReputation(member: string, points = 3): Promise<void> {
  const { pool } = getClients();
  const tx = await pool.boostReputation(member, BigInt(points));
  await tx.wait();
}

export async function buildX402Header(amountUsdc: number, recipient: string): Promise<string> {
  const { signer } = getClients();
  const payload = {
    amount:    String(Math.round(amountUsdc * 1_000_000)),
    currency:  'USDC',
    recipient,
    network:   process.env.KITE_NETWORK ?? 'kite-mainnet',
    nonce:     Date.now(),
  };
  const signature = await signer.signMessage(JSON.stringify(payload));
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

export async function getPoolStats(): Promise<PoolStats> {
  const { pool } = getClients();

  const [totalPool, totalRevenue, queryPrice, memberAddrs] = await Promise.all([
    pool.totalPoolBalance()  as Promise<bigint>,
    pool.totalRevenueEarned() as Promise<bigint>,
    pool.queryPrice()        as Promise<bigint>,
    pool.getAllMembers()      as Promise<string[]>,
  ]);

  const members: MemberData[] = await Promise.all(
    memberAddrs.map(async (addr) => {
      const m = await pool.members(addr);
      return {
        address:     addr,
        balance:     Number(m.balance)     / 1e6,
        reputation:  Number(m.reputation),
        totalSpent:  Number(m.totalSpent)  / 1e6,
        totalEarned: Number(m.totalEarned) / 1e6,
        active:      m.active as boolean,
      };
    })
  );

  return {
    totalPool:    Number(totalPool)    / 1e6,
    totalRevenue: Number(totalRevenue) / 1e6,
    queryPrice:   Number(queryPrice)   / 1e6,
    memberCount:  memberAddrs.length,
    members,
  };
}
