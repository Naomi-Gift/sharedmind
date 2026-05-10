// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./helpers/BaseTest.sol";

/**
 * @notice Tests for GroupFactory — group creation, registry, public listing.
 */
contract FactoryTest is BaseTest {

    // ─── Creation ─────────────────────────────────────────────────────

    function test_CreateGroup_RegistersPool() public {
        assertEq(factory.getGroupCount(), 1);
        assertTrue(factory.isRegistered(address(pool)));
    }

    function test_CreateGroup_SetsMetadata() public view {
        GroupFactory.GroupInfo memory info = factory.getGroup(0);
        assertEq(info.name,    "Test Group");
        assertEq(info.focus,   "DeFi");
        assertEq(info.creator, alice);
        assertTrue(info.isPublic);
        assertGt(info.createdAt, 0);
    }

    function test_CreateGroup_CreatorIsOwnerAdminMember() public view {
        assertEq(pool.owner(), alice);
        assertTrue(pool.isAdmin(alice));
        assertTrue(pool.isActive(alice));
    }

    function test_CreateGroup_UsesDefaultAgent() public view {
        assertEq(pool.agent(), agent);
    }

    function test_CreateGroup_UsesAgentOverride() public {
        address customAgent = makeAddr("customAgent");
        vm.prank(bob);
        address poolAddr = factory.createGroup(
            "Bob Group", "Legal", "desc", true, customAgent
        );
        assertEq(GroupPool(poolAddr).agent(), customAgent);
    }

    function test_CreateGroup_PrivateGroup() public {
        vm.prank(bob);
        address poolAddr = factory.createGroup(
            "Private Group", "Trading", "desc", false, address(0)
        );
        assertFalse(GroupPool(poolAddr).isPublic());
    }

    function test_CreateGroup_Revert_EmptyName() public {
        vm.prank(bob);
        vm.expectRevert(GroupFactory.EmptyName.selector);
        factory.createGroup("", "DeFi", "desc", true, address(0));
    }

    // ─── Multiple groups ──────────────────────────────────────────────

    function test_MultipleGroups_TrackedPerCreator() public {
        vm.prank(bob);
        factory.createGroup("Bob Group 1", "DeFi", "desc", true, address(0));
        vm.prank(bob);
        factory.createGroup("Bob Group 2", "Legal", "desc", false, address(0));

        uint256[] memory bobGroups = factory.getCreatorGroups(bob);
        assertEq(bobGroups.length, 2);
    }

    function test_MultipleGroups_TotalCount() public {
        vm.prank(bob);
        factory.createGroup("B1", "DeFi", "d", true, address(0));
        vm.prank(charlie);
        factory.createGroup("C1", "Legal", "d", true, address(0));

        assertEq(factory.getGroupCount(), 3); // alice's + bob's + charlie's
    }

    // ─── Public listing ───────────────────────────────────────────────

    function test_GetPublicGroups_ReturnsOnlyPublic() public {
        vm.prank(bob);
        factory.createGroup("Public B", "DeFi", "d", true, address(0));
        vm.prank(charlie);
        factory.createGroup("Private C", "Legal", "d", false, address(0));

        (address[] memory pools,,,,) = factory.getPublicGroups();
        assertEq(pools.length, 2); // alice's + bob's (charlie's is private)
    }

    function test_GetPublicGroups_IncludesStats() public {
        _addAndDeposit(bob, 100 * 1e6);

        (
            address[] memory pools,
            string[]  memory names,
            string[]  memory focuses,
            uint256[] memory memberCounts,
            uint256[] memory poolBalances
        ) = factory.getPublicGroups();

        assertEq(pools.length, 1);
        assertEq(names[0], "Test Group");
        assertEq(focuses[0], "DeFi");
        assertEq(memberCounts[0], 2); // alice + bob
        assertEq(poolBalances[0], 100 * 1e6);
    }

    // ─── Admin ────────────────────────────────────────────────────────

    function test_SetTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        factory.setTreasury(newTreasury);
        assertEq(factory.treasury(), newTreasury);
    }

    function test_SetTreasury_Revert_ZeroAddress() public {
        vm.expectRevert(GroupFactory.ZeroAddress.selector);
        factory.setTreasury(address(0));
    }

    function test_SetDefaultAgent() public {
        address newAgent = makeAddr("newAgent");
        factory.setDefaultAgent(newAgent);
        assertEq(factory.defaultAgent(), newAgent);
    }

    function test_Pause_BlocksGroupCreation() public {
        factory.pause();
        vm.prank(bob);
        vm.expectRevert();
        factory.createGroup("Blocked", "DeFi", "d", true, address(0));
    }

    function test_Unpause_AllowsGroupCreation() public {
        factory.pause();
        factory.unpause();
        vm.prank(bob);
        address p = factory.createGroup("Unblocked", "DeFi", "d", true, address(0));
        assertTrue(factory.isRegistered(p));
    }

    function test_SetTreasury_Revert_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert();
        factory.setTreasury(makeAddr("x"));
    }
}
