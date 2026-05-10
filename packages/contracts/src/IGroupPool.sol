// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  IGroupPool
 * @notice Shared interface, events, and custom errors for GroupPool.
 *         Imported by all base contracts and the final GroupPool.
 */
interface IGroupPool {

    // ─── Enums ────────────────────────────────────────────────────────

    enum ProposalType {
        SET_QUERY_PRICE,
        SET_MAX_MEMBERS,
        SET_AGENT,
        ADD_ADMIN,
        REMOVE_ADMIN,
        SET_PUBLIC
    }

    // ─── Events ───────────────────────────────────────────────────────

    // Membership
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member);
    event MemberRemoved(address indexed member, uint256 refundAmount);
    event AdminGranted(address indexed member);
    event AdminRevoked(address indexed member);

    // Ledger
    event Deposited(address indexed member, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event RevenueClaimed(address indexed member, uint256 amount);
    event RequestPaid(
        address indexed member,
        uint256         cost,
        string          model,
        bytes32         requestHash,
        uint256         timestamp
    );
    event RevenueSplit(
        uint256 gross,
        uint256 protocolFee,
        uint256 distributed,
        uint256 timestamp
    );
    event ReputationUpdated(address indexed member, uint256 newScore);

    // Streaks
    event StreakUpdated(address indexed member, uint256 streak);
    event MilestoneReached(address indexed member, uint256 milestone, uint256 bonusRep);

    // Governance
    event ProposalCreated(uint256 indexed id, ProposalType pType, address proposer);
    event VoteCast(uint256 indexed id, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);

    // Admin
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event QueryPriceUpdated(uint256 newPrice);
    event GroupMetadataUpdated(string name, string focus, string description, bool isPublic);

    // ─── Errors ───────────────────────────────────────────────────────

    // Membership
    error NotMember();
    error NotAdmin();
    error AlreadyActive();
    error AlreadyInvited();
    error NotInvited();
    error PoolFull();

    // Ledger
    error InsufficientBalance();
    error DailyLimitExceeded();
    error InsufficientContractBalance();
    error CannotRecoverPoolToken();
    error RequestHashReused();

    // Governance
    error ProposalNotFound();
    error ProposalExpired();
    error ProposalNotExpired();
    error AlreadyVoted();
    error ProposalAlreadyExecuted();
    error QuorumNotMet();
    error ProposalFailed();

    // Streaks
    error MilestoneAlreadyClaimed();

    // General
    error NotAgent();
    error ZeroAddress();
    error ZeroAmount();
    error InvalidParam();
}
