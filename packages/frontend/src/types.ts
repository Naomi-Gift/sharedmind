export interface Attestation {
  txHash: string;
  requestHash: string;
  blockNumber: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  model?: string;
  tier?: string;
  cost?: number;
  attestation?: Attestation;
}

export interface GroupMessage {
  id: string;
  author: string;       // address
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: number;
  type: 'text' | 'ai-result' | 'system' | 'streak';
  cost?: number;
  model?: string;
}

export interface MemoryEntry {
  member: string;
  prompt: string;
  response: string;
  model: string;
  txHash: string;
  requestHash: string;
  timestamp: number;
}

export interface MemberData {
  address: string;
  balance: number;
  reputation: number;
  totalSpent: number;
  totalEarned: number;
  active: boolean;
  role?: string;
}

export interface PoolStats {
  totalPool: number;
  totalRevenue: number;
  queryPrice: number;
  memberCount: number;
  members: MemberData[];
}

export interface IncomingQuery {
  payer: string;
  query: string;
  paid: number;
  timestamp: number;
}

export interface StreakData {
  address: string;
  name: string;
  initials: string;
  accentColor: string;
  currentStreak: number;
  longestStreak: number;
  todayActive: boolean;
  lastActive: number;       // unix ms
  weekActivity: boolean[];  // [Mon..Sun]
  totalSessions: number;
  totalQueries: number;
}
