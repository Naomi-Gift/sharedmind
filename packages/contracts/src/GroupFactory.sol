// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./GroupPool.sol";

/**
 * @title  GroupFactory
 * @author SharedMind
 * @notice Deploys GroupPool instances and maintains a registry.
 *         Collects protocol fees from all pools via the treasury address.
 *
 * Anyone can create a group. The factory owner can pause new group creation
 * and update the default agent address.
 */
contract GroupFactory is Ownable, Pausable {

    // ─── State ────────────────────────────────────────────────────────

    address public immutable USDC;
    address public treasury;
    address public defaultAgent;

    struct GroupInfo {
        address pool;
        address creator;
        string  name;
        string  focus;
        bool    isPublic;
        uint256 createdAt;
    }

    GroupInfo[] public groups;
    mapping(address => uint256[]) public creatorGroups;   // creator → group indices
    mapping(address => bool)      public isRegistered;    // pool address → registered

    // ─── Events ───────────────────────────────────────────────────────

    event GroupCreated(
        uint256 indexed id,
        address indexed pool,
        address indexed creator,
        string  name,
        string  focus,
        bool    isPublic
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DefaultAgentUpdated(address indexed oldAgent, address indexed newAgent);

    // ─── Errors ───────────────────────────────────────────────────────

    error ZeroAddress();
    error EmptyName();

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(address _usdc, address _agent, address _treasury) Ownable(msg.sender) {
        if (_usdc     == address(0)) revert ZeroAddress();
        if (_agent    == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        USDC         = _usdc;
        defaultAgent = _agent;
        treasury     = _treasury;
    }

    // ─── Create ───────────────────────────────────────────────────────

    /**
     * @notice Deploy a new GroupPool. Caller becomes the pool owner and first admin.
     * @param  name        Group name (required).
     * @param  focus       Focus area string.
     * @param  description Group description.
     * @param  isPublic    Whether the group appears in public listings.
     * @param  agentOverride  Pass address(0) to use the factory default agent.
     * @return pool        Address of the deployed GroupPool.
     */
    function createGroup(
        string  calldata name,
        string  calldata focus,
        string  calldata description,
        bool             isPublic,
        address          agentOverride
    ) external whenNotPaused returns (address pool) {
        if (bytes(name).length == 0) revert EmptyName();

        address agentAddr = agentOverride != address(0) ? agentOverride : defaultAgent;

        // Deploy pool — msg.sender becomes Ownable owner
        GroupPool newPool = new GroupPool(
            USDC,
            agentAddr,
            treasury,
            name,
            focus,
            description,
            isPublic
        );

        // Factory is still owner here — add creator as member + admin first
        newPool.addMember(msg.sender);
        newPool.grantAdmin(msg.sender);

        // Now transfer ownership to the creator
        newPool.transferOwnership(msg.sender);

        pool = address(newPool);

        uint256 id = groups.length;
        groups.push(GroupInfo({
            pool:      pool,
            creator:   msg.sender,
            name:      name,
            focus:     focus,
            isPublic:  isPublic,
            createdAt: block.timestamp
        }));

        creatorGroups[msg.sender].push(id);
        isRegistered[pool] = true;

        emit GroupCreated(id, pool, msg.sender, name, focus, isPublic);
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getGroupCount() external view returns (uint256) {
        return groups.length;
    }

    function getGroup(uint256 id) external view returns (GroupInfo memory) {
        return groups[id];
    }

    /**
     * @notice Returns all public groups with basic stats for the discovery UI.
     */
    function getPublicGroups() external view returns (
        address[] memory pools,
        string[]  memory names,
        string[]  memory focuses,
        uint256[] memory memberCounts,
        uint256[] memory poolBalances
    ) {
        uint256 total = groups.length;
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (groups[i].isPublic) count++;
        }

        pools        = new address[](count);
        names        = new string[](count);
        focuses      = new string[](count);
        memberCounts = new uint256[](count);
        poolBalances = new uint256[](count);

        uint256 j = 0;
        for (uint256 i = 0; i < total; i++) {
            if (!groups[i].isPublic) continue;
            GroupPool p = GroupPool(groups[i].pool);
            pools[j]        = groups[i].pool;
            names[j]        = groups[i].name;
            focuses[j]      = groups[i].focus;
            memberCounts[j] = p.getMemberCount();
            (uint256 bal,,,,,,) = p.getPoolStats();
            poolBalances[j] = bal;
            j++;
        }
    }

    function getCreatorGroups(address creator) external view returns (uint256[] memory) {
        return creatorGroups[creator];
    }

    // ─── Admin ────────────────────────────────────────────────────────

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function setDefaultAgent(address _agent) external onlyOwner {
        if (_agent == address(0)) revert ZeroAddress();
        emit DefaultAgentUpdated(defaultAgent, _agent);
        defaultAgent = _agent;
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
