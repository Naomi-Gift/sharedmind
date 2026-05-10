export interface MemoryEntry {
  member: string;
  prompt: string;
  response: string;
  model: string;
  txHash: string;
  requestHash: string;
  timestamp: number;
}

export interface Attestation {
  txHash: string;
  requestHash: string;
  blockNumber: number;
}

export interface ModelConfig {
  id: string;
  costPer1k: number;
  provider: 'anthropic' | 'openai';
  tier: 'simple' | 'medium' | 'complex';
}

export interface MemberData {
  address: string;
  balance: number;
  reputation: number;
  totalSpent: number;
  totalEarned: number;
  active: boolean;
}

export interface PoolStats {
  totalPool: number;
  totalRevenue: number;
  queryPrice: number;
  memberCount: number;
  members: MemberData[];
}
