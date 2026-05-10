// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title  MockUSDC
 * @notice Test USDC with 6 decimals. Anyone can mint up to 10,000 USDC per call.
 *         Deploy this on testnet alongside GroupPool.
 */
contract MockUSDC is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e6; // 10,000 USDC

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 1M USDC to deployer for testing
        _mint(msg.sender, 1_000_000 * 1e6);
    }

    /// @notice 6 decimals to match real USDC.
    function decimals() public pure override returns (uint8) { return 6; }

    /// @notice Anyone can call this to get 10,000 test USDC.
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Owner can mint arbitrary amounts.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
