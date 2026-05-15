import * as dotenv from 'dotenv';
import * as path from 'path';
// Load .env relative to where npm run dev is executed (packages/backend/)
dotenv.config({ path: path.join(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import { agentRouter } from './routes/agent';
import { queryRouter }  from './routes/query';
import { poolRouter }   from './routes/pool';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ───────────────────────────────────────────────────────

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Always allow localhost in dev
const devOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / Postman / server-to-server
    if (devOrigins.includes(origin)) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Allow any *.vercel.app subdomain
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '64kb' }));

// Basic rate limit — 60 req/min per IP (no extra dep needed)
const rateCounts = new Map<string, { count: number; reset: number }>();
app.use((req, res, next) => {
  const ip  = req.ip ?? 'unknown';
  const now = Date.now();
  const rec = rateCounts.get(ip);
  if (!rec || now > rec.reset) {
    rateCounts.set(ip, { count: 1, reset: now + 60_000 });
    return next();
  }
  rec.count++;
  if (rec.count > 60) {
    res.status(429).json({ error: 'Too many requests — slow down' });
    return;
  }
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    version: '1.0.0',
    chain:   process.env.KITE_RPC_URL ? 'configured' : 'demo',
    ai:      process.env.GROQ_API_KEY ? 'configured' : 'demo',
  });
});

app.use('/api/agent', agentRouter);
app.use('/api/query', queryRouter);
app.use('/api/pool',  poolRouter);

// ─── 404 + error handler ─────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`SharedMind backend :${PORT}`);
  console.log(`  Chain: ${process.env.KITE_RPC_URL ?? 'demo mode'}`);
  console.log(`  AI:    ${process.env.GROQ_API_KEY ? 'Groq configured' : 'demo mode'}`);
});
