// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./helpers/BaseTest.sol";

/**
 * @notice Tests for MemberRegistry — invites, joining, removal, admin roles.
 */
contract MembershipTest is BaseTest {

    // ─── Factory integration ──────────────────────────────────────────

    function test_Factory_AliceIsOwnerAdminAndMember() public view {
        assertEq(pool.owner(), alice);
        assertTrue(pool.isAdmin(alice));
        assertTrue(pool.isActive(alice));
        assertEq(pool.getMemberCount(), 1);
    }

    function test_Factory_RegistersPool() public view {
        assertTrue(factory.isRegistered(address(pool)));
        assertEq(factory.getGroupCount(), 1);
        GroupFactory.GroupInfo memory info = factory.getGroup(0);
        assertEq(info.creator, alice);
        assertEq(info.name, "Test Group");
        assertTrue(info.isPublic);
    }

    // ─── Invite / Join ────────────────────────────────────────────────

    function test_InviteAndJoin() public {
        vm.prank(alice);
        pool.inviteMember(bob);
        assertTrue(pool.isInvited(bob));
        assertFalse(pool.isActive(bob));

        vm.prank(bob);
        pool.join();
        assertTrue(pool.isActive(bob));
        assertEq(pool.getMemberCount(), 2);
    }

    function test_BatchInvite() public {
        address[] memory addrs = new address[](2);
        addrs[0] = bob; addrs[1] = charlie;
        vm.prank(alice);
        pool.batchInvite(addrs);
        assertTrue(pool.isInvited(bob));
        assertTrue(pool.isInvited(charlie));
    }

    function test_BatchInvite_SkipsDuplicates() public {
        address[] memory addrs = new address[](3);
        addrs[0] = bob; addrs[1] = bob; addrs[2] = charlie;
        vm.prank(alice);
        pool.batchInvite(addrs);
        // Should not revert, bob invited once
        assertTrue(pool.isInvited(bob));
    }

    function test_AddMemberDirect() public {
        _addMember(bob);
        assertTrue(pool.isActive(bob));
        assertEq(pool.getMemberCount(), 2);
        // Starting reputation assigned
        assertEq(pool.getReputation(bob), 10);
    }

    // ─── Reverts ──────────────────────────────────────────────────────

    function test_Revert_JoinWithoutInvite() public {
        vm.prank(bob);
        vm.expectRevert(IGroupPool.NotInvited.selector);
        pool.join();
    }

    function test_Revert_JoinTwice() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.AlreadyActive.selector);
        pool.join();
    }

    function test_Revert_InviteAlreadyActive() public {
        _addMember(bob);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.AlreadyActive.selector);
        pool.inviteMember(bob);
    }

    function test_Revert_InviteAlreadyInvited() public {
        vm.prank(alice);
        pool.inviteMember(bob);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.AlreadyInvited.selector);
        pool.inviteMember(bob);
    }

    function test_Revert_NonAdminCannotInvite() public {
        _addMember(bob);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.NotAdmin.selector);
        pool.inviteMember(charlie);
    }

    function test_Revert_PoolFull() public {
        // Set maxMembers to 2 (alice already in)
        vm.prank(alice);
        pool.setMaxMembers(2);
        _addMember(bob);

        vm.prank(alice);
        vm.expectRevert(IGroupPool.PoolFull.selector);
        pool.addMember(charlie);
    }

    // ─── Remove ───────────────────────────────────────────────────────

    function test_RemoveMember_RefundsBalance() public {
        _addAndDeposit(bob, 500 * 1e6);
        uint256 before = usdc.balanceOf(bob);

        vm.prank(alice);
        pool.removeMember(bob);

        assertFalse(pool.isActive(bob));
        assertEq(pool.getMemberCount(), 1);
        assertEq(usdc.balanceOf(bob), before + 500 * 1e6);
    }

    function test_RemoveMember_ClearsReputation() public {
        _addMember(bob);
        uint256 repBefore = pool.totalReputation();

        vm.prank(alice);
        pool.removeMember(bob);

        assertEq(pool.totalReputation(), repBefore - 10);
    }

    function test_Revert_RemoveNonMember() public {
        vm.prank(alice);
        vm.expectRevert(IGroupPool.NotMember.selector);
        pool.removeMember(bob);
    }

    // ─── Admin roles ──────────────────────────────────────────────────

    function test_GrantAndRevokeAdmin() public {
        _addMember(bob);
        vm.prank(alice);
        pool.grantAdmin(bob);
        assertTrue(pool.isAdmin(bob));

        vm.prank(alice);
        pool.revokeAdmin(bob);
        assertFalse(pool.isAdmin(bob));
    }

    function test_AdminCanInvite() public {
        _addMember(bob);
        vm.prank(alice);
        pool.grantAdmin(bob);

        vm.prank(bob);
        pool.inviteMember(charlie); // should not revert
        assertTrue(pool.isInvited(charlie));
    }

    function test_Revert_GrantAdminToNonMember() public {
        vm.prank(alice);
        vm.expectRevert(IGroupPool.NotMember.selector);
        pool.grantAdmin(bob);
    }

    // ─── Pause ────────────────────────────────────────────────────────

    function test_Pause_BlocksJoin() public {
        vm.prank(alice);
        pool.inviteMember(bob);
        vm.prank(alice);
        pool.pause();

        vm.prank(bob);
        vm.expectRevert();
        pool.join();
    }

    function test_Unpause_AllowsJoin() public {
        vm.prank(alice);
        pool.inviteMember(bob);
        vm.prank(alice);
        pool.pause();
        vm.prank(alice);
        pool.unpause();

        vm.prank(bob);
        pool.join();
        assertTrue(pool.isActive(bob));
    }
}
