// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GroupFactory.sol";
import "../src/GroupPool.sol";
import "../src/MockUSDC.sol";

/**
 * Usage:
 *
 *   # Local (anvil) — deploys MockUSDC + Factory + a demo group
 *   forge script script/Deploy.s.sol:DeployLocal \
 *     --rpc-url localhost --broadcast -vvvv
 *
 *   # Kite chain — deploys Factory only (uses real USDC)
 *   forge script script/Deploy.s.sol:DeployKite \
 *     --rpc-url $KITE_RPC_URL \
 *     --private-key $DEPLOYER_PRIVATE_KEY \
 *     --broadcast --verify -vvvv
 */

contract DeployLocal is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address agentWallet = vm.envOr("AGENT_ADDRESS", deployer);

        vm.startBroadcast(deployerKey);

        // 1. MockUSDC (6 decimals, faucet available)
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC:      ", address(usdc));

        // 2. GroupFactory (treasury = deployer for testnet)
        GroupFactory factory = new GroupFactory(address(usdc), agentWallet, deployer);
        console.log("GroupFactory:  ", address(factory));

        // 3. Create a demo group via factory
        address pool = factory.createGroup(
            "SharedMind Demo",
            "DeFi / AI",
            "Demo group for SharedMind protocol",
            true,   // public
            address(0)
        );
        console.log("Demo GroupPool:", pool);

        // 4. Mint 1000 USDC to deployer and deposit 100 into pool
        usdc.mint(deployer, 1000 * 1e6);
        usdc.approve(pool, 100 * 1e6);
        GroupPool(pool).deposit(100 * 1e6);
        console.log("Deposited 100 USDC into demo pool");

        vm.stopBroadcast();

        console.log("\n========== DEPLOYMENT COMPLETE ==========");
        console.log("Network:     Kite Testnet (chain 2368)");
        console.log("MockUSDC:   ", address(usdc));
        console.log("Factory:    ", address(factory));
        console.log("Demo Pool:  ", pool);
        console.log("Agent:      ", agentWallet);
        console.log("=========================================");
        console.log("\nAdd to backend .env:");
        console.log("  POOL_CONTRACT_ADDRESS=", pool);
        console.log("\nAdd to frontend .env.local:");
        console.log("  NEXT_PUBLIC_POOL_CONTRACT=", pool);
        console.log("  NEXT_PUBLIC_FACTORY_CONTRACT=", address(factory));
    }
}

contract DeployKite is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address agentWallet = vm.envAddress("AGENT_ADDRESS");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address treasury    = vm.envOr("TREASURY_ADDRESS", vm.addr(deployerKey));

        vm.startBroadcast(deployerKey);

        GroupFactory factory = new GroupFactory(usdcAddress, agentWallet, treasury);
        console.log("GroupFactory deployed:", address(factory));

        vm.stopBroadcast();

        console.log("\n=== KITE DEPLOYMENT ===");
        console.log("USDC:        ", usdcAddress);
        console.log("Factory:     ", address(factory));
        console.log("Agent:       ", agentWallet);
        console.log("Treasury:    ", treasury);
        console.log("=======================");
        console.log("\nNext: set FACTORY_ADDRESS=", address(factory), "in backend .env");
        console.log("Then call factory.createGroup(...) to deploy your first pool");
    }
}
