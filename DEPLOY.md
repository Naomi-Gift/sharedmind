# SharedMind — Deployment Guide

## Prerequisites

- Node.js 18+
- A Kite chain wallet with USDC (for the agent)
- Anthropic API key (Claude)
- OpenAI API key (GPT-4o)
- Vercel account (or any Node.js host)

---

## 1. Deploy the Smart Contract

The contract is at `packages/contracts/GroupPool.sol`.

**Using Remix (quickest):**
1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Paste `GroupPool.sol` — it imports OpenZeppelin, Remix resolves these automatically
3. Compile with Solidity 0.8.20
4. Connect MetaMask to Kite chain (RPC: `https://rpc.gokite.ai`, Chain ID: check docs)
5. Deploy with constructor args:
   - `_usdc`: USDC contract address on Kite chain
   - `_agent`: your agent wallet address (the backend wallet)
6. Copy the deployed contract address

**After deployment:**
```
# Add yourself as a member
contract.addMember("0xYourAddress")

# Set query price (optional, default 0.12 USDC)
contract.setQueryPrice(120000)  # 6 decimals
```

---

## 2. Deploy the Backend

```bash
cd packages/backend

# Install
npm install

# Configure
cp .env.example .env
# Fill in all values in .env

# Build
npm run build

# Test locally
npm start
```

**Deploy to Vercel:**
```bash
cd packages/backend
npx vercel --prod
# Set environment variables in Vercel dashboard
```

Environment variables to set in Vercel:
- `KITE_RPC_URL`
- `KITE_NETWORK`
- `AGENT_PRIVATE_KEY`
- `POOL_CONTRACT_ADDRESS`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `QUERY_PRICE_USDC`
- `FRONTEND_URL`

---

## 3. Deploy the Frontend

```bash
cd packages/frontend

# Install
npm install

# Configure
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

# Update vercel.json with your actual backend URL
# Edit packages/frontend/vercel.json

# Build
npm run build

# Deploy
npx vercel --prod
```

---

## 4. Verify Everything Works

```bash
# Health check
curl https://your-backend.vercel.app/health

# Test a prompt (replace with real address and API keys)
curl -X POST https://your-backend.vercel.app/api/agent/prompt \
  -H "Content-Type: application/json" \
  -d '{"member":"0xYourAddress","prompt":"Hello"}'

# Pool stats
curl https://your-backend.vercel.app/api/pool/stats
```

---

## Architecture

```
User Browser
    │
    ├── / (Landing)     → Vercel (Next.js static)
    └── /app (App)      → Vercel (Next.js SSR)
              │
              └── /api/* → Vercel (Express backend)
                              │
                              ├── Anthropic Claude API
                              ├── OpenAI GPT-4o API
                              └── Kite Chain (GroupPool.sol)
```

---

## Demo Mode

If `KITE_RPC_URL`, `AGENT_PRIVATE_KEY`, or `POOL_CONTRACT_ADDRESS` are not set, the backend runs in **demo mode**:
- AI calls still work (if API keys are set)
- Attestations return fake tx hashes
- Pool stats return demo data

This lets you run the frontend fully without a deployed contract.
