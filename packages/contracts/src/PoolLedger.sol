// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MemberRegistry.sol";

/**
 * @title  PoolLedger
 * @notice Handles USDC balances, deposits, withdrawals, AI request debits,
 *         x402 revenue splitting, and reputation accounting.
 *         Extends MemberRegistry.
 */
abstract contract PoolLedger is MemberRegistry, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────

    uint256 public constant MAX_REP          = 100;
    uint256 public constant PROTOCOL_FEE_BPS = 500;   // 5%
    uint256 public constant BPS_DENOM        = 10_000;

    // ─── Immutables ───────────────────────────────────────────────────

    IERC20  public immutable USDC;
    address public immutable TREASURY;

    // ─── Storage ──────────────────────────────────────────────────────

    address public agent;

    struct LedgerEntry {
        uint256 balance;
        uint256 claimableRevenue;
        uint256 reputation;
        uint256 totalSpent;
        uint256 totalEarned;
        uint256 dailySpent;
        uint256 dailyLimit;
        uint256 lastSpendDay;
        uint256 totalRequests;
    }

    mapping(address => LedgerEntry) internal _ledger;
    mapping(bytes32 => bool)        public   usedRequestHashes;

    uint256 public totalPoolBalance;
    uint256 public totalRevenueEarned;
    uint256 public totalProtocolFees;
    uint256 public totalReputation;
    uint256 public queryPrice = 120_000; // 0.12 USDC

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(address _usdc, address _agent, address _treasury) {
        if (_usdc     == address(0)) revert ZeroAddress();
        if (_agent    == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        USDC     = IERC20(_usdc);
        agent    = _agent;
        TREASURY = _treasury;
    }

    // ─── Member Actions ───────────────────────────────────────────────

    function deposit(uint256 amount) external onlyMember nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        _ledger[msg.sender].balance += amount;
        totalPoolBalance            += amount;
        _addReputation(msg.sender, 2);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external onlyMember nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (_ledger[msg.sender].balance < amount) revert InsufficientBalance();
        unchecked {
            _ledger[msg.sender].balance -= amount;
            totalPoolBalance            -= amount;
        }
        USDC.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimRevenue() external onlyMember nonReentrant {
        uint256 amt = _ledger[msg.sender].claimableRevenue;
        if (amt == 0) revert ZeroAmount();
        _ledger[msg.sender].claimableRevenue = 0;
        _ledger[msg.sender].balance          += amt;
        emit RevenueClaimed(msg.sender, amt);
    }

    // ─── Agent Actions ────────────────────────────────────────────────

    function debit(
        address         member,
        uint256         cost,
        string calldata model,
        bytes32         requestHash
    ) external onlyAgent whenNotPaused {
        if (!_memberCore[member].active)        revert NotMember();
        if (_ledger[member].balance < cost)     revert InsufficientBalance();
        if (usedRequestHashes[requestHash])     revert RequestHashReused();

        usedRequestHashes[requestHash] = true;

        uint256 today = block.timestamp / 1 days;
        if (_ledger[member].lastSpendDay < today) {
            _ledger[member].dailySpent   = 0;
            _ledger[member].lastSpendDay = today;
        }
        if (_ledger[member].dailyLimit > 0) {
            if (_ledger[member].dailySpent + cost > _ledger[member].dailyLimit)
                revert DailyLimitExceeded();
        }

        unchecked {
            _ledger[member].balance       -= cost;
            _ledger[member].totalSpent    += cost;
            _ledger[member].dailySpent    += cost;
            _ledger[member].totalRequests++;
            totalPoolBalance              -= cost;
        }

        _addReputation(member, 1);
        _onRequestDebited(member, today);

        emit RequestPaid(member, cost, model, requestHash, block.timestamp);
    }

    function creditRevenue(uint256 grossAmount) external onlyAgent nonReentrant whenNotPaused {
        if (_memberList.length == 0) revert NotMember();
        if (grossAmount == 0)        revert ZeroAmount();

        uint256 contractBal = USDC.balanceOf(address(this));
        if (contractBal < totalPoolBalance + grossAmount)
            revert InsufficientContractBalance();

        uint256 fee       = (grossAmount * PROTOCOL_FEE_BPS) / BPS_DENOM;
        uint256 netAmount = grossAmount - fee;

        if (fee > 0) {
            USDC.safeTransfer(TREASURY, fee);
            unchecked { totalProtocolFees += fee; }
        }

        uint256 distributed = 0;
        uint256 len = _memberList.length;

        for (uint256 i = 0; i < len; i++) {
            address m = _memberList[i];
            if (!_memberCore[m].active || _ledger[m].reputation == 0) continue;
            uint256 share = (netAmount * _ledger[m].reputation) / totalReputation;
            if (share > 0) {
                unchecked {
                    _ledger[m].claimableRevenue += share;
                    _ledger[m].totalEarned      += share;
                    distributed                 += share;
                }
            }
        }

        // Dust → first active member
        uint256 dust = netAmount - distributed;
        if (dust > 0 && len > 0) {
            unchecked {
                _ledger[_memberList[0]].claimableRevenue += dust;
                _ledger[_memberList[0]].totalEarned      += dust;
            }
        }

        unchecked {
            totalPoolBalance   += netAmount;
            totalRevenueEarned += grossAmount;
        }

        emit RevenueSplit(grossAmount, fee, netAmount, block.timestamp);
    }

    function boostReputation(address member, uint256 points) external onlyAgent {
        if (!_memberCore[member].active) revert NotMember();
        _addReputation(member, points);
    }

    // ─── Admin ────────────────────────────────────────────────────────

    function setAgent(address _agent) external onlyOwner {
        if (_agent == address(0)) revert ZeroAddress();
        emit AgentUpdated(agent, _agent);
        agent = _agent;
    }

    function setDailyLimit(address member, uint256 limit) external onlyAdmin {
        _ledger[member].dailyLimit = limit;
    }

    function setQueryPrice(uint256 price) external onlyOwner {
        queryPrice = price;
        emit QueryPriceUpdated(price);
    }

    function recoverToken(address token, uint256 amount) external onlyOwner {
        if (token == address(USDC)) revert CannotRecoverPoolToken();
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getBalance(address m)    external view returns (uint256) { return _ledger[m].balance; }
    function getReputation(address m) external view returns (uint256) { return _ledger[m].reputation; }

    function getLedgerData(address m) external view returns (
        uint256 balance,
        uint256 claimableRevenue,
        uint256 reputation,
        uint256 totalSpent,
        uint256 totalEarned,
        uint256 dailyLimit,
        uint256 totalRequests
    ) {
        LedgerEntry storage e = _ledger[m];
        return (e.balance, e.claimableRevenue, e.reputation,
                e.totalSpent, e.totalEarned, e.dailyLimit, e.totalRequests);
    }

    function getPoolStats() external view returns (
        uint256 poolBalance,
        uint256 revenueEarned,
        uint256 protocolFees,
        uint256 memberCount,
        uint256 price,
        uint256 repTotal,
        bool    paused_
    ) {
        return (totalPoolBalance, totalRevenueEarned, totalProtocolFees,
                _memberList.length, queryPrice, totalReputation, paused());
    }

    // ─── Internal ─────────────────────────────────────────────────────

    function _addReputation(address member, uint256 points) internal {
        uint256 current = _ledger[member].reputation;
        uint256 next    = current + points > MAX_REP ? MAX_REP : current + points;
        unchecked { totalReputation = totalReputation - current + next; }
        _ledger[member].reputation = next;
        emit ReputationUpdated(member, next);
    }

    // ─── Hooks ────────────────────────────────────────────────────────

    /// @dev MemberRegistry hook — initialise ledger entry on join.
    function _onMemberJoined(address member) internal virtual override {
        _ledger[member].reputation = STARTING_REP;
        totalReputation           += STARTING_REP;
    }

    /// @dev MemberRegistry hook — clear ledger on removal, return refund.
    function _onMemberRemoved(address member) internal virtual override returns (uint256 refund) {
        refund = _ledger[member].balance + _ledger[member].claimableRevenue;
        uint256 rep = _ledger[member].reputation;

        if (totalPoolBalance >= refund) totalPoolBalance -= refund;
        if (totalReputation  >= rep)    totalReputation  -= rep;

        delete _ledger[member];

        if (refund > 0) USDC.safeTransfer(member, refund);
    }

    /// @dev Called by debit — StreakTracker overrides this to update streaks.
    function _onRequestDebited(address member, uint256 today) internal virtual {}
}
