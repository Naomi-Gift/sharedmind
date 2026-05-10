// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Governance.sol";

/**
 * @title  GroupPool
 * @author SharedMind
 * @notice Thin composition contract. Inherits:
 *           MemberRegistry  → membership, invites, roles
 *           PoolLedger       → USDC balances, debit, revenue split
 *           StreakTracker    → daily streaks, milestone bonuses
 *           Governance       → proposals, voting, execution
 *
 * Deployment: use GroupFactory.createGroup() — it sets ownership,
 *             adds the creator as first member + admin, and registers
 *             the pool in the public registry.
 */
contract GroupPool is Governance {

    // ─── Group metadata ───────────────────────────────────────────────

    string  public groupName;
    string  public groupFocus;
    string  public groupDescription;
    bool    public isPublic;

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(
        address _usdc,
        address _agent,
        address _treasury,
        string  memory _name,
        string  memory _focus,
        string  memory _description,
        bool    _isPublic
    )
        PoolLedger(_usdc, _agent, _treasury)
        Ownable(msg.sender)
    {
        groupName        = _name;
        groupFocus       = _focus;
        groupDescription = _description;
        isPublic         = _isPublic;
    }

    // ─── Metadata ─────────────────────────────────────────────────────

    function updateMetadata(
        string calldata _name,
        string calldata _focus,
        string calldata _description,
        bool            _isPublic
    ) external onlyOwner {
        groupName        = _name;
        groupFocus       = _focus;
        groupDescription = _description;
        isPublic         = _isPublic;
        emit GroupMetadataUpdated(_name, _focus, _description, _isPublic);
    }

    // ─── Pause ────────────────────────────────────────────────────────

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ─── Governance hook ──────────────────────────────────────────────

    function _setPublic(bool pub) internal override {
        isPublic = pub;
        emit GroupMetadataUpdated(groupName, groupFocus, groupDescription, pub);
    }
}
