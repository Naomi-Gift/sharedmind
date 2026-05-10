// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./helpers/BaseTest.sol";

contract StreaksTest is BaseTest {

    uint256 constant T0 = 1_700_000_000; // fixed start time

    function setUp() public override {
        super.setUp();
        vm.warp(T0);
        _addAndDeposit(bob, 10 * 1e6);
    }

    // ─── Streak increments ────────────────────────────────────────────

    function test_Streak_StartsAtOne() public {
        _debit(bob, 100, keccak256("d1"));
        (uint256 streak,,,) = pool.getStreakInfo(bob);
        assertEq(streak, 1);
    }

    function test_Streak_IncrementConsecutiveDays() public {
        vm.warp(T0);                  _debit(bob, 100, keccak256("d1"));
        vm.warp(T0 + 1 days);         _debit(bob, 100, keccak256("d2"));
        vm.warp(T0 + 2 days);         _debit(bob, 100, keccak256("d3"));
        (uint256 streak,,,) = pool.getStreakInfo(bob);
        assertEq(streak, 3);
    }

    function test_Streak_MultipleDebitsOnSameDayCountOnce() public {
        vm.warp(T0);
        _debit(bob, 100, keccak256("d1"));
        _debit(bob, 100, keccak256("d2"));
        _debit(bob, 100, keccak256("d3"));
        (uint256 streak,,,) = pool.getStreakInfo(bob);
        assertEq(streak, 1);
    }

    function test_Streak_BreaksAfterMissedDay() public {
        vm.warp(T0);          _debit(bob, 100, keccak256("d1"));
        vm.warp(T0 + 2 days); _debit(bob, 100, keccak256("d2")); // skip day 1
        (uint256 streak,,,) = pool.getStreakInfo(bob);
        assertEq(streak, 1);
    }

    function test_Streak_LongestPreservedAfterBreak() public {
        // Build streak of 3
        vm.warp(T0);          _debit(bob, 100, keccak256("b1"));
        vm.warp(T0 + 1 days); _debit(bob, 100, keccak256("b2"));
        vm.warp(T0 + 2 days); _debit(bob, 100, keccak256("b3"));
        // Break it
        vm.warp(T0 + 10 days); _debit(bob, 100, keccak256("after"));
        (, uint256 longest,,) = pool.getStreakInfo(bob);
        assertEq(longest, 3);
    }

    // ─── Milestones ───────────────────────────────────────────────────

    function _buildStreak(uint256 days_) internal {
        for (uint256 i = 0; i < days_; i++) {
            vm.warp(T0 + i * 1 days);
            _debit(bob, 100, keccak256(abi.encode("streak", i)));
        }
    }

    function test_Milestone_7Days() public {
        _buildStreak(7);
        (, uint256 longest,,) = pool.getStreakInfo(bob);
        assertEq(longest, 7);

        uint256 repBefore = pool.getReputation(bob);
        pool.claimMilestone(bob, 0); // index 0 = 7 days, +5 rep
        assertEq(pool.getReputation(bob), repBefore + 5);
    }

    function test_Milestone_14Days() public {
        _buildStreak(14);
        uint256 repBefore = pool.getReputation(bob);
        pool.claimMilestone(bob, 1); // index 1 = 14 days, +8 rep
        assertEq(pool.getReputation(bob), repBefore + 8);
    }

    function test_Milestone_AllFive() public {
        _buildStreak(60);
        uint256[5] memory bonuses = [uint256(5), 8, 12, 18, 25];
        uint256 rep = pool.getReputation(bob);
        for (uint256 i = 0; i < 5; i++) {
            pool.claimMilestone(bob, i);
            uint256 expected = rep + bonuses[i] > 100 ? 100 : rep + bonuses[i];
            assertEq(pool.getReputation(bob), expected);
            rep = pool.getReputation(bob);
        }
    }

    function test_Milestone_Revert_NotReached() public {
        _buildStreak(3); // only 3 days, need 7
        vm.expectRevert(IGroupPool.InvalidParam.selector);
        pool.claimMilestone(bob, 0);
    }

    function test_Milestone_Revert_ClaimTwice() public {
        _buildStreak(7);
        pool.claimMilestone(bob, 0);
        vm.expectRevert(IGroupPool.MilestoneAlreadyClaimed.selector);
        pool.claimMilestone(bob, 0);
    }

    function test_Milestone_Revert_InvalidIndex() public {
        vm.expectRevert(IGroupPool.InvalidParam.selector);
        pool.claimMilestone(bob, 99);
    }

    function test_Milestone_AnyoneCanClaim() public {
        _buildStreak(7);
        vm.prank(charlie); // charlie is not a member of this pool
        pool.claimMilestone(bob, 0);
        assertTrue(pool.milestoneClaimed(bob, 0));
    }

    // ─── View ─────────────────────────────────────────────────────────

    function test_GetStreakInfo_InitialState() public view {
        (uint256 cur, uint256 longest, uint256 lastDay, bool[5] memory claimed) =
            pool.getStreakInfo(bob);
        assertEq(cur, 0);
        assertEq(longest, 0);
        assertEq(lastDay, 0);
        for (uint256 i = 0; i < 5; i++) assertFalse(claimed[i]);
    }
}
