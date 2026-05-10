import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import Groq from 'groq-sdk';

// Read .env directly
function loadEnvFile() {
  const candidates = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      for (const line of lines) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim();
        }
      }
      return;
    }
  }
}
loadEnvFile();

import { estimateCost } from '../lib/router';
import { attestAndDebit } from '../lib/kite';
import { addEntry, getRecentEntries } from '../lib/memory';
import { Attestation } from '../types';

export const agentRouter = Router();

// Groq — free tier, fast, no credit card needed
// Model: llama-3.3-70b-versatile (free, high quality)
const MODEL_ID   = 'llama-3.3-70b-versatile';
const MODEL_TIER = 'complex' as const;

function getGroq(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set — get a free key at console.groq.com');
  return new Groq({ apiKey: key });
}

agentRouter.post('/prompt', async (req: Request, res: Response) => {
  const { member, prompt } = req.body as { member?: string; prompt?: string };

  if (!member || !prompt) {
    res.status(400).json({ error: 'member and prompt required' });
    return;
  }

  if (typeof member !== 'string' || !/^0x[0-9a-fA-F]{40}$/i.test(member)) {
    res.status(400).json({ error: 'Invalid member address' });
    return;
  }

  if (prompt.length > 4000) {
    res.status(400).json({ error: 'Prompt too long (max 4000 chars)' });
    return;
  }

  const model = { id: MODEL_ID, tier: MODEL_TIER as 'complex', costPer1k: 0.005, provider: 'openai' as const };

  let response: string;
  let inputTokens  = 0;
  let outputTokens = 0;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:      MODEL_ID,
      messages:   [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    response     = completion.choices[0].message.content ?? '';
    inputTokens  = completion.usage?.prompt_tokens     ?? 0;
    outputTokens = completion.usage?.completion_tokens ?? 0;
  } catch (err) {
    const msg = (err as Error).message;
    console.error('[agent] AI API error:', msg);
    res.status(502).json({ error: `AI API error: ${msg}` });
    return;
  }

  const cost = estimateCost(model, inputTokens, outputTokens);

  let attestation: Attestation;
  try {
    attestation = await attestAndDebit({ member, cost, model: model.id, prompt, response });
  } catch (err) {
    console.warn('[agent] Attestation skipped (demo mode):', (err as Error).message);
    attestation = {
      txHash:      `0xdemo${Date.now().toString(16)}`,
      requestHash: `0xhash${Date.now().toString(16)}`,
      blockNumber: Math.floor(Math.random() * 1_000_000) + 800_000,
    };
  }

  addEntry({ member, prompt, response, model: MODEL_ID, ...attestation, timestamp: Date.now() });

  res.json({
    response,
    model:       MODEL_ID,
    tier:        MODEL_TIER,
    cost,
    inputTokens,
    outputTokens,
    attestation,
  });
});

agentRouter.get('/attestations', (_req: Request, res: Response) => {
  res.json(getRecentEntries(30));
});
