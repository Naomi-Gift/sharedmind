import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import { searchMemory, getStats } from '../lib/memory';
import { creditRevenue, boostReputation } from '../lib/kite';

export const queryRouter = Router();

const QUERY_PRICE_USDC = parseFloat(process.env.QUERY_PRICE_USDC ?? '0.12');
const NETWORK          = process.env.KITE_NETWORK ?? 'kite-mainnet';

queryRouter.post('/', async (req: Request, res: Response) => {
  const paymentHeader = req.headers['x-payment'] as string | undefined;

  // Step 1 — no payment → return 402 with payment details
  if (!paymentHeader) {
    res.status(402).json({
      error:   'Payment Required',
      details: {
        price:    QUERY_PRICE_USDC,
        currency: 'USDC',
        network:  NETWORK,
        payTo:    process.env.POOL_CONTRACT_ADDRESS ?? '',
        scheme:   'x402',
        endpoint: '/api/query',
      },
    });
    return;
  }

  // Step 2 — validate payment header
  let payerAddress: string;
  try {
    const raw     = Buffer.from(paymentHeader, 'base64').toString('utf8');
    const decoded = JSON.parse(raw) as {
      payload:   { amount: string; currency: string; network?: string };
      signature: string;
    };

    payerAddress = ethers.verifyMessage(JSON.stringify(decoded.payload), decoded.signature);

    const amount = Number(decoded.payload.amount) / 1e6;
    if (amount < QUERY_PRICE_USDC) {
      res.status(402).json({ error: `Insufficient payment — need ${QUERY_PRICE_USDC} USDC` });
      return;
    }
    if (decoded.payload.currency !== 'USDC') {
      res.status(402).json({ error: 'Only USDC accepted' });
      return;
    }
  } catch {
    res.status(400).json({ error: 'Invalid X-Payment header' });
    return;
  }

  // Step 3 — validate query
  const { query } = req.body as { query?: string };
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'query field required' });
    return;
  }

  // Step 4 — search group memory
  const results = searchMemory(query.trim(), 5);
  if (results.length === 0) {
    res.status(404).json({ error: 'No relevant knowledge found in group memory' });
    return;
  }

  const answer = results
    .map((r, i) => `[${i + 1}] ${r.response.slice(0, 400)}`)
    .join('\n\n');

  // Step 5 — credit revenue on-chain
  try {
    await creditRevenue(QUERY_PRICE_USDC);
    const uniqueMembers = [...new Set(results.map(r => r.member))];
    await Promise.all(uniqueMembers.map(m => boostReputation(m, 3)));
  } catch (err) {
    console.warn('[query] Revenue credit skipped (demo mode):', (err as Error).message);
  }

  res.json({
    answer,
    sources:     results.length,
    paidBy:      payerAddress,
    amountPaid:  QUERY_PRICE_USDC,
    memoryStats: getStats(),
  });
});

queryRouter.get('/stats', (_req: Request, res: Response) => {
  res.json(getStats());
});
