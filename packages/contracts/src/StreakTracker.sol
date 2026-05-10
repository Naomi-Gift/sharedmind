// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PoolLedger.sol";

/**
 * @title  StreakTracker
 * @notice Tracks daily activity streaks per member and handles milestone claims.
 *         Extends PoolLedger.
 */
abstract contract StreakTracker is PoolLedger {

    // ─── Constants ────────────────────────────────────────────────────

    uint8 public constant MILESTONE_COUNT = 5;

    uint256[5] public STREAK_MILESTONES = [7,  14,  21,  30,  60];
    uint256[5] public STREAK_BONUS_REP  = [5,  8,   12,  18,  25];

    // ─── Storage ──────────────────────────────────────────────────────

    struct StreakEntry {
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastActiveDay;
    }

    mapping(address => StreakEntry)                    internal _streaks;
    mapping(address => mapping(uint256 => bool))       public   milestoneClaimed;

    // ─── External ─────────────────────────────────────────────────────

    /**
     * @notice Claim a streak milestone bonus reputation.
     *         Anyone can call on behalf of any member once the milestone is reached.
     */
    function claimMilestone(address member, uint256 milestoneIndex) external {
        if (!_memberCore[member].active)                         revert NotMember();
        if (milestoneIndex >= MILESTONE_COUNT)                   revert InvalidParam();
        if (milestoneClaimed[member][milestoneIndex])            revert MilestoneAlreadyClaimed();
        if (_streaks[member].longestStreak < STREAK_MILESTONES[milestoneIndex])
            revert InvalidParam();

        milestoneClaimed[member][milestoneIndex] = true;
        uint256 bonus = STREAK_BONUS_REP[milestoneIndex];
        _addReputation(member, bonus);

        emit MilestoneReached(member, STREAK_MILESTONES[milestoneIndex], bonus);
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getStreakInfo(address member) external view returns (
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 lastActiveDay,
        bool[5] memory milestonesClaimed
    ) {
        bool[5] memory claimed;
        for (uint256 i = 0; i < MILESTONE_COUNT; i++) {
            claimed[i] = milestoneClaimed[member][i];
        }
        return (
            _streaks[member].currentStreak,
            _streaks[member].longestStreak,
            _streaks[member].lastActiveDay,
            claimed
        );
    }

    // ─── Hook override ────────────────────────────────────────────────

    function _onRequestDebited(address member, uint256 today) internal virtual override {
        _updateStreak(member, today);
    }

    // ─── Internal ─────────────────────────────────────────────────────

    function _updateStreak(address member, uint256 today) internal {
        StreakEntry storage s = _streaks[member];
        uint256 lastDay = s.lastActiveDay;

        if (lastDay == 0) {
            s.currentStreak = 1;
        } else if (today == lastDay) {
            return; // already active today
        } else if (today == lastDay + 1) {
            unchecked { s.currentStreak++; }
        } else {
            s.currentStreak = 1; // streak broken
        }

        s.lastActiveDay = today;

        if (s.currentStreak > s.longestStreak) {
            s.longestStreak = s.currentStreak;
        }

        emit StreakUpdated(member, s.currentStreak);
    }
}
