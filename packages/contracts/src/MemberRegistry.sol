// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IGroupPool.sol";

/**
 * @title  MemberRegistry
 * @notice Manages membership: invites, joining, removal, admin roles.
 *         Abstract base — does not handle USDC or reputation directly.
 */
abstract contract MemberRegistry is Ownable, Pausable, IGroupPool {

    // ─── Constants ────────────────────────────────────────────────────

    uint256 public constant MAX_MEMBERS  = 100;
    uint256 public constant STARTING_REP = 10;

    // ─── Storage ──────────────────────────────────────────────────────

    struct MemberCore {
        bool    active;
        bool    invited;
        bool    isAdmin;
    }

    mapping(address => MemberCore) internal _memberCore;
    address[] internal _memberList;
    uint256 public maxMembers = 20;

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyMember() {
        if (!_memberCore[msg.sender].active) revert NotMember();
        _;
    }

    modifier onlyAdmin() {
        if (!_memberCore[msg.sender].isAdmin && msg.sender != owner())
            revert NotAdmin();
        _;
    }

    // ─── Invite / Join ────────────────────────────────────────────────

    function inviteMember(address member) external onlyAdmin whenNotPaused {
        if (_memberCore[member].active)          revert AlreadyActive();
        if (_memberCore[member].invited)         revert AlreadyInvited();
        if (_memberList.length >= maxMembers)    revert PoolFull();
        _memberCore[member].invited = true;
        emit MemberInvited(member, msg.sender);
    }

    function batchInvite(address[] calldata addrs) external onlyAdmin whenNotPaused {
        uint256 len = addrs.length;
        if (_memberList.length + len > maxMembers) revert PoolFull();
        for (uint256 i = 0; i < len; i++) {
            address m = addrs[i];
            if (m == address(0) || _memberCore[m].active || _memberCore[m].invited) continue;
            _memberCore[m].invited = true;
            emit MemberInvited(m, msg.sender);
        }
    }

    function join() external whenNotPaused {
        if (!_memberCore[msg.sender].invited) revert NotInvited();
        if (_memberCore[msg.sender].active)   revert AlreadyActive();
        _memberCore[msg.sender].active = true;
        _memberList.push(msg.sender);
        _onMemberJoined(msg.sender);
        emit MemberJoined(msg.sender);
    }

    /// @dev Called by owner or factory to add a member directly.
    function _addMemberDirect(address member) internal {
        if (member == address(0))               revert ZeroAddress();
        if (_memberCore[member].active)         revert AlreadyActive();
        if (_memberList.length >= maxMembers)   revert PoolFull();
        _memberCore[member].invited = true;
        _memberCore[member].active  = true;
        _memberList.push(member);
        _onMemberJoined(member);
        emit MemberJoined(member);
    }

    function addMember(address member) external onlyOwner whenNotPaused {
        _addMemberDirect(member);
    }

    function removeMember(address member) external onlyOwner {
        if (!_memberCore[member].active) revert NotMember();
        _memberCore[member].active  = false;
        _memberCore[member].isAdmin = false;
        uint256 refund = _onMemberRemoved(member);
        _swapAndPop(member);
        emit MemberRemoved(member, refund);
    }

    function grantAdmin(address member) external onlyOwner {
        if (!_memberCore[member].active) revert NotMember();
        _memberCore[member].isAdmin = true;
        emit AdminGranted(member);
    }

    function revokeAdmin(address member) external onlyOwner {
        _memberCore[member].isAdmin = false;
        emit AdminRevoked(member);
    }

    function setMaxMembers(uint256 cap) external onlyOwner {
        if (cap == 0 || cap > MAX_MEMBERS) revert InvalidParam();
        maxMembers = cap;
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getMemberCount()              external view returns (uint256) { return _memberList.length; }
    function getAllMembers()               external view returns (address[] memory) { return _memberList; }
    function isActive(address m)           external view returns (bool) { return _memberCore[m].active; }
    function isInvited(address m)          external view returns (bool) { return _memberCore[m].invited; }
    function isAdmin(address m)            external view returns (bool) { return _memberCore[m].isAdmin; }

    // ─── Hooks (implemented by child contracts) ───────────────────────

    /// @dev Called when a member joins. Child initialises reputation etc.
    function _onMemberJoined(address member) internal virtual;

    /// @dev Called before removal. Child clears balances and returns refund amount.
    function _onMemberRemoved(address member) internal virtual returns (uint256 refund);

    // ─── Internal ─────────────────────────────────────────────────────

    function _swapAndPop(address member) internal {
        uint256 len = _memberList.length;
        for (uint256 i = 0; i < len; i++) {
            if (_memberList[i] == member) {
                _memberList[i] = _memberList[len - 1];
                _memberList.pop();
                return;
            }
        }
    }
}
