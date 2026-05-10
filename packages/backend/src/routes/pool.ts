import { Router, Request, Response } from 'express';
import { getPoolStats } from '../lib/kite';
import { PoolStats } from '../types';

export const poolRouter = Router();

const DEMO_STATS: PoolStats = {
  totalPool:    47.82,
  totalRevenue: 12.36,
  queryPrice:   0.12,
  memberCount:  4,
  members: [
    { address: '0xDeFi1234…a1b2', balance: 18.50, reputation: 87, totalSpent: 4.20, totalEarned: 3.10, active: true },
    { address: '0xLaw5678…c3d4',  balance: 12.30, reputation: 72, totalSpent: 2.80, totalEarned: 2.40, active: true },
    { address: '0xMed9012…e5f6',  balance: 9.70,  reputation: 65, totalSpent: 1.90, totalEarned: 1.80, active: true },
    { address: '0xTrd3456…g7h8',  balance: 7.32,  reputation: 58, totalSpent: 1.40, totalEarned: 1.06, active: true },
  ],
};

poolRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getPoolStats();
    res.json(stats);
  } catch {
    res.json(DEMO_STATS);
  }
});
