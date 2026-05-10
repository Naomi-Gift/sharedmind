// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./helpers/BaseTest.sol";

/**
 * @notice Tests for PoolLedger — deposit, withdraw, debit, revenue split,
 *         reputation, replay protection, daily limits.
 */
contract LedgerTest is BaseTest {

    // ─── Deposit ──────────────────────────────────────────────────────

    function test_Deposit_UpdatesBalance() public {
        _addAndDeposit(bob, 1000 * 1e6);
        assertEq(pool.getBalance(bob), 1000 * 1e6);
        assertEq(pool.totalPoolBalance(), 1000 * 1e6);
    }

    function test_Deposit_BoostsReputation() public {
        _addAndDeposit(bob, 1000 * 1e6);
        assertEq(pool.getReputation(bob), 12); // 10 start + 2 deposit
    }

    function test_Deposit_Revert_NotMember() public {
        vm.startPrank(bob);
        usdc.approve(address(pool), 100 * 1e6);
        vm.expectRevert(IGroupPool.NotMember.selector);
        pool.deposit(100 * 1e6);
        vm.stopPrank();
    }

    function test_Deposit_Revert_ZeroAmount() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.ZeroAmount.selector);
        pool.deposit(0);
    }

    // ─── Withdraw ─────────────────────────────────────────────────────

    function test_Withdraw_ReducesBalance() public {
        _addAndDeposit(bob, 1000 * 1e6);
        vm.prank(bob);
        pool.withdraw(400 * 1e6);
        assertEq(pool.getBalance(bob), 600 * 1e6);
        assertEq(usdc.balanceOf(bob), MINT - 600 * 1e6);
    }

    function test_Withdraw_Revert_Insufficient() public {
        _addAndDeposit(bob, 100 * 1e6);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.InsufficientBalance.selector);
        pool.withdraw(200 * 1e6);
    }

    function test_Withdraw_Revert_ZeroAmount() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.ZeroAmount.selector);
        pool.withdraw(0);
    }

    // ─── Debit ────────────────────────────────────────────────────────

    function test_Debit_DeductsBalance() public {
        _addAndDeposit(bob, 100 * 1e6);
        _debit(bob, 5_000, keccak256("req1"));
        assertEq(pool.getBalance(bob), 100 * 1e6 - 5_000);
        assertEq(pool.totalPoolBalance(), 100 * 1e6 - 5_000);
    }

    function test_Debit_IncrementsReputation() public {
        _addAndDeposit(bob, 100 * 1e6);
        uint256 repBefore = pool.getReputation(bob);
        _debit(bob, 100, keccak256("req1"));
        assertEq(pool.getReputation(bob), repBefore + 1);
    }

    function test_Debit_IncrementsRequestCount() public {
        _addAndDeposit(bob, 100 * 1e6);
        _debit(bob, 100, keccak256("req1"));
        (,,,,,, uint256 reqs) = pool.getLedgerData(bob);
        assertEq(reqs, 1);
    }

    function test_Debit_Revert_NotAgent() public {
        _addAndDeposit(bob, 100 * 1e6);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.NotAgent.selector);
        pool.debit(bob, 100, "haiku", keccak256("req1"));
    }

    function test_Debit_Revert_InsufficientBalance() public {
        _addMember(bob);
        vm.prank(agent);
        vm.expectRevert(IGroupPool.InsufficientBalance.selector);
        pool.debit(bob, 1, "haiku", keccak256("req1"));
    }

    function test_Debit_Revert_ReplayProtection() public {
        _addAndDeposit(bob, 100 * 1e6);
        bytes32 h = keccak256("req1");
        _debit(bob, 100, h);
        vm.prank(agent);
        vm.expectRevert(IGroupPool.RequestHashReused.selector);
        pool.debit(bob, 100, "haiku", h);
    }

    // ─── Daily limit ──────────────────────────────────────────────────

    function test_DailyLimit_Enforced() public {
        _addAndDeposit(bob, 100 * 1e6);
        vm.prank(alice);
        pool.setDailyLimit(bob, 1_000);

        _debit(bob, 600, keccak256("r1"));
        vm.prank(agent);
        vm.expectRevert(IGroupPool.DailyLimitExceeded.selector);
        pool.debit(bob, 500, "haiku", keccak256("r2"));
    }

    function test_DailyLimit_ResetsNextDay() public {
        _addAndDeposit(bob, 100 * 1e6);
        vm.prank(alice);
        pool.setDailyLimit(bob, 1_000);

        _debit(bob, 1_000, keccak256("r1"));
        vm.warp(block.timestamp + 1 days);
        _debit(bob, 1_000, keccak256("r2")); // should not revert
    }

    function test_DailyLimit_ZeroMeansUnlimited() public {
        _addAndDeposit(bob, 100 * 1e6);
        // dailyLimit = 0 by default → unlimited
        for (uint256 i = 0; i < 5; i++) {
            _debit(bob, 100, keccak256(abi.encode(i)));
        }
        assertEq(pool.getBalance(bob), 100 * 1e6 - 500);
    }

    // ─── Revenue split ────────────────────────────────────────────────

    function test_Revenue_TakesProtocolFee() public {
        _addAndDeposit(bob, 50 * 1e6);
        uint256 gross = 10 * 1e6;
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        _sendRevenue(gross);

        // 5% of 10 USDC = 0.5 USDC
        assertEq(usdc.balanceOf(treasury), treasuryBefore + 500_000);
        assertEq(pool.totalProtocolFees(), 500_000);
    }

    function test_Revenue_SplitsEquallyWithEqualRep() public {
        _addAndDeposit(bob,     50 * 1e6);
        _addAndDeposit(charlie, 50 * 1e6);
        // bob rep=12, charlie rep=12 after deposits

        uint256 gross = 19 * 1e6;
        _sendRevenue(gross);

        (, uint256 claimBob,,,,,)     = pool.getLedgerData(bob);
        (, uint256 claimCharlie,,,,,) = pool.getLedgerData(charlie);
        assertApproxEqAbs(claimBob, claimCharlie, 1);
    }

    function test_Revenue_SplitsProportionalToRep() public {
        _addAndDeposit(bob,     50 * 1e6);
        _addAndDeposit(charlie, 50 * 1e6);

        // Give bob extra rep via debits
        for (uint256 i = 0; i < 10; i++) {
            _debit(bob, 100, keccak256(abi.encode("bob", i)));
        }
        // bob rep = 12 + 10 = 22, charlie rep = 12

        uint256 gross = 34 * 1e6;
        _sendRevenue(gross);

        (, uint256 claimBob,,,,,)     = pool.getLedgerData(bob);
        (, uint256 claimCharlie,,,,,) = pool.getLedgerData(charlie);
        // net = 32.3M, bob gets 22/34 * 32.3M ≈ 20.9M, charlie 12/34 * 32.3M ≈ 11.4M
        assertGt(claimBob, claimCharlie);
    }

    function test_Revenue_Revert_InsufficientContractBalance() public {
        _addAndDeposit(bob, 50 * 1e6);
        // Don't mint USDC to contract first
        vm.prank(agent);
        vm.expectRevert(IGroupPool.InsufficientContractBalance.selector);
        pool.creditRevenue(1 * 1e6);
    }

    function test_Revenue_Revert_ZeroAmount() public {
        _addMember(bob);
        vm.prank(agent);
        vm.expectRevert(IGroupPool.ZeroAmount.selector);
        pool.creditRevenue(0);
    }

    // ─── Claim revenue ────────────────────────────────────────────────

    function test_ClaimRevenue_MovesToBalance() public {
        _addAndDeposit(bob, 50 * 1e6);
        _sendRevenue(10 * 1e6);

        (, uint256 claimable,,,,,) = pool.getLedgerData(bob);
        assertTrue(claimable > 0);

        vm.prank(bob);
        pool.claimRevenue();

        (uint256 bal, uint256 claimAfter,,,,,) = pool.getLedgerData(bob);
        assertEq(claimAfter, 0);
        assertEq(bal, 50 * 1e6 + claimable);
    }

    function test_ClaimRevenue_Revert_NothingToClaim() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.ZeroAmount.selector);
        pool.claimRevenue();
    }

    // ─── Reputation cap ───────────────────────────────────────────────

    function test_Reputation_CapsAt100() public {
        _addAndDeposit(bob, 100 * 1e6);
        // Debit 200 times — each gives +1 rep, but cap is 100
        for (uint256 i = 0; i < 200; i++) {
            _debit(bob, 1, keccak256(abi.encode("cap", i)));
        }
        assertEq(pool.getReputation(bob), 100);
    }

    // ─── Boost reputation ─────────────────────────────────────────────

    function test_BoostReputation() public {
        _addMember(bob);
        uint256 before = pool.getReputation(bob);
        vm.prank(agent);
        pool.boostReputation(bob, 5);
        assertEq(pool.getReputation(bob), before + 5);
    }

    function test_BoostReputation_Revert_NotAgent() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.NotAgent.selector);
        pool.boostReputation(bob, 5);
    }
}
