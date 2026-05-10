// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/GroupPool.sol";
import "../../src/GroupFactory.sol";
import "../../src/MockUSDC.sol";
import "../../src/IGroupPool.sol";

abstract contract BaseTest is Test {
    GroupFactory factory;
    GroupPool    pool;
    MockUSDC     usdc;

    address agent    = makeAddr("agent");
    address treasury = makeAddr("treasury");
    address alice    = makeAddr("alice");
    address bob      = makeAddr("bob");
    address charlie  = makeAddr("charlie");

    uint256 constant MINT = 100_000 * 1e6;

    function setUp() public virtual {
        usdc    = new MockUSDC();
        factory = new GroupFactory(address(usdc), agent, treasury);

        vm.prank(alice);
        address poolAddr = factory.createGroup("Test Group","DeFi","desc",true,address(0));
        pool = GroupPool(poolAddr);

        usdc.mint(alice,   MINT);
        usdc.mint(bob,     MINT);
        usdc.mint(charlie, MINT);
    }

    function _addMember(address who) internal {
        vm.prank(alice);
        pool.addMember(who);
    }

    function _deposit(address who, uint256 amount) internal {
        vm.startPrank(who);
        usdc.approve(address(pool), amount);
        pool.deposit(amount);
        vm.stopPrank();
    }

    function _addAndDeposit(address who, uint256 amount) internal {
        _addMember(who);
        if (amount > 0) _deposit(who, amount);
    }

    function _debit(address who, uint256 cost, bytes32 h) internal {
        vm.prank(agent);
        pool.debit(who, cost, "haiku", h);
    }

    function _sendRevenue(uint256 gross) internal {
        usdc.mint(address(pool), gross);
        vm.prank(agent);
        pool.creditRevenue(gross);
    }
}
