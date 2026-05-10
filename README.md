# SharedMind — Group Intelligence Protocol

> Pool USDC on-chain. Build collective AI knowledge. Sell it to the world.

**Kite AI Hackathon 2026 · Agentic Commerce Track**

---

## What It Is

SharedMind is the first on-chain group AI economy. A group of researchers, lawyers, doctors, or traders pools USDC into a smart contract. Their shared agent pays AI APIs via x402 micropayments. Every response is attested on Kite chain. Over time, that knowledge becomes a monetizable x402 API — other agents pay USDC to query it, and revenue flows back to members proportional to their reputation.

**Members stop being consumers of AI. They become producers of intelligence.**

---

## Stack

| Layer | Technology |
|---|---|
| Blockchain | Kite L1 Testnet |
| Agent Identity | Kite Agent Passport |
| Payments | x402 Protocol (X-PAYMENT header) |
| Token | USDC |
| Smart Contract | Solidity — `packages/contracts/GroupPool.sol` |
| Agent Backend | Node.js + Express — `packages/backend/` |
| AI APIs | Anthropic Claude (Haiku + Sonnet) · OpenAI GPT-4o |
| Frontend | React + Tailwind + Framer Motion |

---

## Quick Start

```bash
# 1. Install dependencies
npm install
cd packages/frontend && npm install
cd ../backend && npm install

# 2. Configure backend
cp packages/backend/.env.example packages/backend/.env
# Fill in KITE_RPC_URL, AGENT_PRIVATE_KEY, POOL_CONTRACT_ADDRESS, ANTHROPIC_API_KEY

# 3. Deploy the smart contract (Kite testnet)
# Use Remix or Hardhat with Kite L1 RPC: https://rpc-testnet.gokite.ai
# Constructor args: USDC address, agent wallet address

# 4. Run backend
cd packages/backend && npm run dev

# 5. Run frontend
cd packages/frontend && npm run dev
# → http://localhost:5173
```

---

## Architecture

```
Members (USDC)
     │
     ▼
GroupPool.sol (Kite L1)
     │
     ▼
SharedMind Agent (Kite Agent Passport)
     │
     ├── Outbound: x402 → Claude/GPT-4o → response → attest → debit member
     │
     └── Inbound:  x402 /query ← external agents pay 0.12 USDC
                        │
                        └── search group memory → return answer → creditRevenue()
```

---

## The Value Loop

1. Members deposit USDC → agent pays AI APIs → responses attested on Kite chain
2. Attestation log = group knowledge corpus
3. Group lists corpus as x402 API at 0.12 USDC/query
4. External agents discover and pay → revenue split by reputation weight
5. More usage → more knowledge → higher query demand → more revenue

---

## Key Files

- `packages/contracts/GroupPool.sol` — smart contract (deposit, debit, creditRevenue, reputation)
- `packages/backend/src/lib/kite.js` — Kite chain integration + x402 payment signing
- `packages/backend/src/lib/router.js` — cost router (Haiku/Sonnet/GPT-4o)
- `packages/backend/src/routes/agent.js` — member prompt → AI → attest
- `packages/backend/src/routes/query.js` — x402 external query endpoint
- `packages/frontend/src/App.jsx` — main app with 4 tabs
