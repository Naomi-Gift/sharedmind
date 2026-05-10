# SharedMind Contracts

Built with [Foundry](https://book.getfoundry.sh/).

## Setup

```bash
# Install Foundry if you haven't
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Clone dependencies (already in lib/ if you cloned the repo)
# If starting fresh:
git clone --depth 1 https://github.com/OpenZeppelin/openzeppelin-contracts.git lib/openzeppelin-contracts
git clone --depth 1 https://github.com/foundry-rs/forge-std.git lib/forge-std
```

## Commands

```bash
# Compile
forge build

# Run all tests
forge test -vv

# Run a specific test
forge test --match-test test_CreditRevenue_TwoMembers -vvvv

# Gas report
forge test --gas-report
```

## Deploy

### 1. Copy and fill env

```bash
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY, AGENT_ADDRESS, KITE_RPC_URL, USDC_ADDRESS
```

### 2. Deploy to local anvil (with MockUSDC)

```bash
# Terminal 1 — start local node
anvil

# Terminal 2 — deploy
source .env
forge script script/Deploy.s.sol:DeployLocal \
  --rpc-url localhost \
  --broadcast \
  -vvvv
```

### 3. Deploy to Kite chain (real USDC)

```bash
source .env
forge script script/Deploy.s.sol:DeployKite \
  --rpc-url $KITE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  -vvvv
```

### 4. After deploy

Copy the `GroupPool` address from the output and set it in your backend:

```bash
# packages/backend/.env
POOL_CONTRACT_ADDRESS=0xYourDeployedAddress
```

Then add your first member:

```bash
cast send $POOL_CONTRACT_ADDRESS \
  "addMember(address)" $YOUR_ADDRESS \
  --rpc-url $KITE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## Contract: GroupPool.sol

| Function | Access | Description |
|---|---|---|
| `addMember(address)` | Owner | Add a member directly |
| `inviteMember(address)` | Owner | Invite (they must call join()) |
| `batchInvite(address[])` | Owner | Invite multiple at once |
| `join()` | Invited | Activate membership |
| `removeMember(address)` | Owner | Remove + refund balance |
| `deposit(uint256)` | Member | Deposit USDC |
| `withdraw(uint256)` | Member | Withdraw USDC |
| `debit(address,uint256,string,bytes32)` | Agent | Debit after AI request |
| `creditRevenue(uint256)` | Agent | Split query revenue |
| `boostReputation(address,uint256)` | Agent | Boost member rep |
| `pause() / unpause()` | Owner | Emergency stop |
| `setQueryPrice(uint256)` | Owner | Update x402 price |
| `setDailyLimit(address,uint256)` | Owner | Set spending cap |
