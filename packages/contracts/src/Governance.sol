// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StreakTracker.sol";

/**
 * @title  Governance
 * @notice On-chain proposal and voting system for GroupPool parameters.
 *         Votes are weighted by reputation. Requires 50% quorum and 60% approval.
 *         Extends StreakTracker.
 */
abstract contract Governance is StreakTracker {

    // ─── Constants ────────────────────────────────────────────────────

    uint256 public constant VOTE_DURATION  = 3 days;
    uint256 public constant QUORUM_BPS     = 5000;  // 50% of totalReputation
    uint256 public constant PASS_THRESHOLD = 6000;  // 60% of votes cast

    // ─── Storage ──────────────────────────────────────────────────────

    struct Proposal {
        ProposalType pType;
        address      proposer;
        bytes        data;
        uint256      votesFor;
        uint256      votesAgainst;
        uint256      deadline;
        bool         executed;
        bool         cancelled;
        mapping(address => bool) voted;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) internal _proposals;

    // ─── External ─────────────────────────────────────────────────────

    function propose(ProposalType pType, bytes calldata data)
        external onlyMember returns (uint256 id)
    {
        id = proposalCount++;
        Proposal storage p = _proposals[id];
        p.pType    = pType;
        p.proposer = msg.sender;
        p.data     = data;
        p.deadline = block.timestamp + VOTE_DURATION;
        emit ProposalCreated(id, pType, msg.sender);
    }

    function vote(uint256 id, bool support) external onlyMember {
        Proposal storage p = _proposals[id];
        if (p.deadline == 0)                  revert ProposalNotFound();
        if (block.timestamp > p.deadline)     revert ProposalExpired();
        if (p.executed || p.cancelled)        revert ProposalAlreadyExecuted();
        if (p.voted[msg.sender])              revert AlreadyVoted();

        p.voted[msg.sender] = true;
        uint256 weight = _ledger[msg.sender].reputation;

        if (support) { unchecked { p.votesFor     += weight; } }
        else         { unchecked { p.votesAgainst += weight; } }

        emit VoteCast(id, msg.sender, support);
    }

    function execute(uint256 id) external onlyMember {
        Proposal storage p = _proposals[id];
        if (p.deadline == 0)               revert ProposalNotFound();
        if (block.timestamp <= p.deadline) revert ProposalNotExpired();
        if (p.executed || p.cancelled)     revert ProposalAlreadyExecuted();

        uint256 totalVotes = p.votesFor + p.votesAgainst;
        uint256 quorum     = (totalReputation * QUORUM_BPS) / BPS_DENOM;
        if (totalVotes < quorum)           revert QuorumNotMet();

        uint256 forBps = (p.votesFor * BPS_DENOM) / totalVotes;
        if (forBps < PASS_THRESHOLD)       revert ProposalFailed();

        p.executed = true;
        _applyProposal(p.pType, p.data);
        emit ProposalExecuted(id);
    }

    function cancelProposal(uint256 id) external {
        Proposal storage p = _proposals[id];
        if (p.deadline == 0)           revert ProposalNotFound();
        if (p.executed || p.cancelled) revert ProposalAlreadyExecuted();
        if (msg.sender != p.proposer && msg.sender != owner()) revert NotAdmin();
        p.cancelled = true;
        emit ProposalCancelled(id);
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getProposal(uint256 id) external view returns (
        ProposalType pType,
        address      proposer,
        uint256      votesFor,
        uint256      votesAgainst,
        uint256      deadline,
        bool         executed,
        bool         cancelled
    ) {
        Proposal storage p = _proposals[id];
        return (p.pType, p.proposer, p.votesFor, p.votesAgainst,
                p.deadline, p.executed, p.cancelled);
    }

    function hasVoted(uint256 id, address voter) external view returns (bool) {
        return _proposals[id].voted[voter];
    }

    // ─── Internal ─────────────────────────────────────────────────────

    function _applyProposal(ProposalType pType, bytes storage data) internal {
        if (pType == ProposalType.SET_QUERY_PRICE) {
            uint256 price = abi.decode(data, (uint256));
            queryPrice = price;
            emit QueryPriceUpdated(price);

        } else if (pType == ProposalType.SET_MAX_MEMBERS) {
            uint256 cap = abi.decode(data, (uint256));
            if (cap == 0 || cap > MAX_MEMBERS) revert InvalidParam();
            maxMembers = cap;

        } else if (pType == ProposalType.SET_AGENT) {
            address newAgent = abi.decode(data, (address));
            if (newAgent == address(0)) revert ZeroAddress();
            emit AgentUpdated(agent, newAgent);
            agent = newAgent;

        } else if (pType == ProposalType.ADD_ADMIN) {
            address target = abi.decode(data, (address));
            if (!_memberCore[target].active) revert NotMember();
            _memberCore[target].isAdmin = true;
            emit AdminGranted(target);

        } else if (pType == ProposalType.REMOVE_ADMIN) {
            address target = abi.decode(data, (address));
            _memberCore[target].isAdmin = false;
            emit AdminRevoked(target);

        } else if (pType == ProposalType.SET_PUBLIC) {
            bool pub = abi.decode(data, (bool));
            _setPublic(pub);
        }
    }

    /// @dev Implemented by GroupPool to update the isPublic flag.
    function _setPublic(bool pub) internal virtual;
}
