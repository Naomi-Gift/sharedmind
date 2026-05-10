// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./helpers/BaseTest.sol";

contract GovernanceTest is BaseTest {

    function setUp() public override {
        super.setUp();
        _addAndDeposit(bob,     50 * 1e6);
        _addAndDeposit(charlie, 50 * 1e6);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    function _propose(IGroupPool.ProposalType pType, bytes memory data)
        internal returns (uint256 id)
    {
        vm.prank(bob);
        id = pool.propose(pType, data);
    }

    function _voteAll(uint256 id, bool support) internal {
        vm.prank(alice);   pool.vote(id, support);
        vm.prank(bob);     pool.vote(id, support);
        vm.prank(charlie); pool.vote(id, support);
    }

    function _passAndExecute(IGroupPool.ProposalType pType, bytes memory data)
        internal returns (uint256 id)
    {
        id = _propose(pType, data);
        _voteAll(id, true);
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice);
        pool.execute(id);
    }

    // ─── Propose ──────────────────────────────────────────────────────

    function test_Propose_CreatesProposal() public {
        uint256 id = _propose(
            IGroupPool.ProposalType.SET_QUERY_PRICE,
            abi.encode(uint256(200_000))
        );
        assertEq(id, 0);
        assertEq(pool.proposalCount(), 1);
        (IGroupPool.ProposalType pType, address proposer,,, uint256 deadline, bool exec, bool cancelled) =
            pool.getProposal(0);
        assertEq(uint8(pType), uint8(IGroupPool.ProposalType.SET_QUERY_PRICE));
        assertEq(proposer, bob);
        assertFalse(exec);
        assertFalse(cancelled);
        assertGt(deadline, block.timestamp);
    }

    function test_Propose_Revert_NotMember() public {
        vm.prank(makeAddr("stranger"));
        vm.expectRevert(IGroupPool.NotMember.selector);
        pool.propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
    }

    // ─── Vote ─────────────────────────────────────────────────────────

    function test_Vote_RecordsVote() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(bob);
        pool.vote(id, true);
        assertTrue(pool.hasVoted(id, bob));
    }

    function test_Vote_WeightedByReputation() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(bob);
        pool.vote(id, true);
        (,, uint256 votesFor,,,, ) = pool.getProposal(id);
        assertEq(votesFor, pool.getReputation(bob));
    }

    function test_Vote_Revert_AlreadyVoted() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(bob);
        pool.vote(id, true);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.AlreadyVoted.selector);
        pool.vote(id, true);
    }

    function test_Vote_Revert_AfterDeadline() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.warp(block.timestamp + 4 days);
        vm.prank(bob);
        vm.expectRevert(IGroupPool.ProposalExpired.selector);
        pool.vote(id, true);
    }

    // ─── Execute ──────────────────────────────────────────────────────

    function test_Execute_SetQueryPrice() public {
        _passAndExecute(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        assertEq(pool.queryPrice(), 200_000);
    }

    function test_Execute_SetMaxMembers() public {
        _passAndExecute(IGroupPool.ProposalType.SET_MAX_MEMBERS, abi.encode(uint256(50)));
        assertEq(pool.maxMembers(), 50);
    }

    function test_Execute_SetAgent() public {
        address newAgent = makeAddr("newAgent");
        _passAndExecute(IGroupPool.ProposalType.SET_AGENT, abi.encode(newAgent));
        assertEq(pool.agent(), newAgent);
    }

    function test_Execute_AddAdmin() public {
        _passAndExecute(IGroupPool.ProposalType.ADD_ADMIN, abi.encode(bob));
        assertTrue(pool.isAdmin(bob));
    }

    function test_Execute_RemoveAdmin() public {
        vm.prank(alice);
        pool.grantAdmin(bob);
        _passAndExecute(IGroupPool.ProposalType.REMOVE_ADMIN, abi.encode(bob));
        assertFalse(pool.isAdmin(bob));
    }

    function test_Execute_SetPublic() public {
        _passAndExecute(IGroupPool.ProposalType.SET_PUBLIC, abi.encode(false));
        assertFalse(pool.isPublic());
    }

    function test_Execute_Revert_BeforeDeadline() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(alice); pool.vote(id, true);
        vm.prank(bob);   pool.vote(id, true);
        // No warp — still within deadline
        vm.prank(alice);
        vm.expectRevert(IGroupPool.ProposalNotExpired.selector);
        pool.execute(id);
    }

    function test_Execute_Revert_QuorumNotMet() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(bob);
        pool.vote(id, true); // only 1/3 members
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.QuorumNotMet.selector);
        pool.execute(id);
    }

    function test_Execute_Revert_ProposalFailed() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        _voteAll(id, false); // all vote against
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.ProposalFailed.selector);
        pool.execute(id);
    }

    function test_Execute_Revert_AlreadyExecuted() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        _voteAll(id, true);
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice); pool.execute(id);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.ProposalAlreadyExecuted.selector);
        pool.execute(id);
    }

    // ─── Cancel ───────────────────────────────────────────────────────

    function test_Cancel_ByProposer() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(bob);
        pool.cancelProposal(id);
        (,,,,,, bool cancelled) = pool.getProposal(id);
        assertTrue(cancelled);
    }

    function test_Cancel_ByOwner() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(alice);
        pool.cancelProposal(id);
        (,,,,,, bool cancelled) = pool.getProposal(id);
        assertTrue(cancelled);
    }

    function test_Cancel_Revert_NotProposerOrOwner() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        vm.prank(charlie);
        vm.expectRevert(IGroupPool.NotAdmin.selector);
        pool.cancelProposal(id);
    }

    function test_Cancel_Revert_AlreadyExecuted() public {
        uint256 id = _propose(IGroupPool.ProposalType.SET_QUERY_PRICE, abi.encode(uint256(200_000)));
        _voteAll(id, true);
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice); pool.execute(id);
        vm.prank(alice);
        vm.expectRevert(IGroupPool.ProposalAlreadyExecuted.selector);
        pool.cancelProposal(id);
    }
}
