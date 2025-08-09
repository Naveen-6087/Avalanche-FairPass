// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "../src/EventContract.sol";
import "../src/EventManager.sol";
import "../src/Marketplace.sol";
import "../src/IEventContract.sol";
import "../src/IEventManager.sol";

contract EventSystemTest is Test {
    EventContract public eventChain;
    EventManager public eventManager;
    Marketplace public marketplace;

    // Event declarations for testing
    event TicketMinted(uint256 indexed tokenId, address indexed owner, string eventDetails, uint256 originalPrice, uint256 expirationDate);
    event TicketExpired(uint256 indexed tokenId);

    address public deployer;
    address public organizer;
    address public alice;
    address public bob;
    address public royaltyReceiver;
    address public marketplaceOwner;
    address public outsider;

    function setUp() public {
        deployer = makeAddr("deployer");
        organizer = makeAddr("organizer");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        royaltyReceiver = makeAddr("royaltyReceiver");
        marketplaceOwner = makeAddr("marketplaceOwner");
        outsider = makeAddr("outsider");

        vm.deal(organizer, 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(royaltyReceiver, 1 ether);
        vm.deal(marketplaceOwner, 1 ether);
        vm.deal(outsider, 1 ether);

        vm.prank(deployer);
        eventChain = new EventContract(deployer);

        vm.prank(organizer);
        eventManager = new EventManager(organizer, address(eventChain));

        vm.prank(deployer);
        marketplace = new Marketplace(address(eventChain), marketplaceOwner);

        bytes4 ERC2981_ID = 0x2a55205a;
        assertTrue(eventChain.supportsInterface(ERC2981_ID));
    }

    uint256 constant MAX_SCAN = 200;

    function findLatestTokenOwnedBy(address who) internal view returns (uint256 tokenId, bool found) {
        for (uint256 i = MAX_SCAN; i > 0; --i) {
            uint256 id = i - 1;
            try eventChain.ownerOf(id) returns (address owner) {
                if (owner == who) return (id, true);
            } catch {}
        }
        return (0, false);
    }

    function findAnyTokenOwnedBy(address who) internal view returns (uint256 tokenId, bool found) {
        for (uint256 id = 0; id < MAX_SCAN; ++id) {
            try eventChain.ownerOf(id) returns (address owner) {
                if (owner == who) return (id, true);
            } catch {}
        }
        return (0, false);
    }

    function test_safeMint_assignsOwner_and_emitsEvent() public {
        address contractAddress = address(eventChain);
        assertTrue(contractAddress != address(0), "Contract address should not be zero");

        vm.expectEmit(true, true, true, true, address(eventChain));
        emit TicketMinted(0, alice, "Concert A", 1 ether, block.timestamp + 1 days);
        
        vm.prank(organizer);
        uint256 tokenId = eventChain.safeMint(alice, "ipfs://token0", "Concert A", 1 ether, block.timestamp + 1 days);

        assertEq(eventChain.ownerOf(tokenId), alice, "Alice should own the returned tokenId");
        string memory uri = eventChain.tokenURI(tokenId);
        assertGt(bytes(uri).length, 0, "Token URI should not be empty");

        assertEq(address(eventChain), contractAddress, "Contract address should remain the same after minting");

        address[] memory history = eventChain.getTicketHistory(tokenId);
        assertEq(history.length, 1, "History should have exactly one entry for new mint");
        assertEq(history[0], alice, "History should show alice as the first owner");

        (uint256 foundId, bool ok) = findAnyTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(foundId, tokenId);
    }

    function test_safeMintWithRoyalty_setsRoyaltyAndReturnsRoyaltyInfo() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMintWithRoyalty(
            bob,
            "ipfs://token1",
            "Concert B",
            2 ether,
            block.timestamp + 2 days,
            royaltyReceiver,
            100
        );

        (uint256 tokenId, bool found) = findAnyTokenOwnedBy(bob);
        assertTrue(found);
        assertEq(tokenId, returned);

        (address rcv, uint256 amount) = eventChain.royaltyInfo(returned, 1 ether);
        assertEq(rcv, royaltyReceiver);
        assertEq(amount, (1 ether * 100) / 10000);
    }

    function test_validateTicket_success_and_doubleValidate_reverts() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://t-validate", "Talk", 0.1 ether, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok, "minted token not found");
        assertEq(tokenId, returned);

        vm.prank(alice);
        eventChain.validateTicket(returned);

        (bool used, bool valid) = eventChain.getTicketStatus(returned);
        assertTrue(used);
        assertTrue(valid);

        vm.prank(alice);
        vm.expectRevert("Ticket already used");
        eventChain.validateTicket(returned);
    }

    function test_validateTicket_nonOwner_reverts() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://t-nonowner", "Seminar", 0, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(bob);
        vm.expectRevert("Not authorized");
        eventChain.validateTicket(returned);
    }

    function test_burnExpiredTickets_allowsOnlyAfterExpiry_and_onlyOwner() public {
        uint256 expiry = block.timestamp + 1 hours;
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://t-exp", "Expo", 0, expiry);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(deployer);
        vm.expectRevert("Ticket still valid");
        eventChain.burnExpiredTickets(returned);

        vm.warp(expiry + 1);

        vm.prank(deployer);
        vm.expectEmit(true, true, true, true, address(eventChain));
        emit TicketExpired(returned);
        eventChain.burnExpiredTickets(returned);

        vm.expectRevert();
        eventChain.ownerOf(returned);
    }

    function test_updateTicketMetadata_and_setMaxResalePrice_onlyOwner() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://meta0", "Conf", 0.2 ether, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(deployer);
        eventChain.updateTicketMetadata(returned, "Conf - UPDATED", "ipfs://meta0-updated");

        string memory newUri = eventChain.tokenURI(returned);
        assertEq(newUri, "ipfs://meta0-updated");

        vm.prank(outsider);
        vm.expectRevert("Ownable: caller is not the owner");
        eventChain.updateTicketMetadata(returned, "X", "Y");

        vm.prank(deployer);
        eventChain.setMaxResalePrice(returned, 1 ether);
        assertEq(eventChain.resalePriceLimit(returned), 1 ether);

        vm.prank(outsider);
        vm.expectRevert("Ownable: caller is not the owner");
        eventChain.setMaxResalePrice(returned, 2 ether);
    }

    function test_safeTransferWithRoyalty_transfersAndPaysRoyalty() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMintWithRoyalty(
            bob,
            "ipfs://t-roy",
            "Show",
            1 ether,
            block.timestamp + 1 days,
            royaltyReceiver,
            500
        );

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(bob);
        assertTrue(ok, "couldn't find bob's minted token");
        assertEq(tokenId, returned);

        (address rrcv, uint256 ramt) = eventChain.royaltyInfo(returned, 1 ether);
        assertEq(rrcv, royaltyReceiver);
        assertEq(ramt, (1 ether * 500) / 10000);

        uint256 before = royaltyReceiver.balance;

        vm.prank(bob);
        eventChain.safeTransferWithRoyalty{value: ramt}(bob, alice, returned, 1 ether);

        assertEq(royaltyReceiver.balance, before + ramt);
        assertEq(eventChain.ownerOf(returned), alice);
        address[] memory hist = eventChain.getTicketHistory(returned);
        assertEq(hist[hist.length - 1], alice);
    }

    function test_transferWithHistoryUpdate_onlyOwner() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://t-transfer", "Meetup", 0, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(deployer);
        eventChain.transferWithHistoryUpdate(alice, bob, returned);

        assertEq(eventChain.ownerOf(returned), bob);
        address[] memory h = eventChain.getTicketHistory(returned);
        assertEq(h[h.length - 1], bob);

        vm.prank(outsider);
        vm.expectRevert("Ownable: caller is not the owner");
        eventChain.transferWithHistoryUpdate(bob, alice, returned);
    }

    function test_eventManager_createEvent_and_mintTicket_works() public {
        vm.prank(organizer);
        eventManager.createEvent("My Fest", "Chennai", "2025-09-01", 0.5 ether);

        IEventManager.Event memory ev = eventManager.getEventDetails(0);
        assertEq(ev.name, "My Fest");
        assertEq(ev.organizer, organizer);

        vm.prank(organizer);
        uint256 returned = eventManager.mintTicket(0, alice, "ipfs://em-ticket", block.timestamp + 7 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);
        assertEq(eventChain.getTicketHistory(returned)[0], alice);
        assertGt(eventChain.balanceOf(alice), 0);
    }

    function test_marketplace_listTicket_reverts_due_to_approvals_disabled() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://t-market", "Gig", 0.1 ether, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(alice);
        vm.expectRevert("Marketplace not approved");
        marketplace.listTicket(returned, 0.2 ether);
    }

    function test_marketplace_admin_updateFee_and_onlyOwnerGuards() public {
        vm.prank(marketplaceOwner);
        marketplace.updateMarketplaceFee(500);
        assertEq(marketplace.marketplaceFee(), 500);

        vm.prank(outsider);
        vm.expectRevert("Ownable: caller is not the owner");
        marketplace.updateMarketplaceFee(400);
    }

    function test_marketplace_withdrawFees_reverts_when_no_balance() public {
        vm.prank(marketplaceOwner);
        vm.expectRevert("No fees to withdraw");
        marketplace.withdrawFees();
    }

    function test_emergencyCancelListing_onlyOwner_and_revert_when_inactive() public {
        vm.prank(marketplaceOwner);
        vm.expectRevert("Listing not active");
        marketplace.emergencyCancelListing(999);
    }

    function test_snapshot_and_revertTo_restores_ownership() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://snap", "SnapEvent", 0, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        uint256 snap = vm.snapshot();

        vm.prank(deployer);
        eventChain.transferWithHistoryUpdate(alice, bob, returned);

        assertEq(eventChain.ownerOf(returned), bob);

        vm.revertTo(snap);

        assertEq(eventChain.ownerOf(returned), alice);
    }

    function test_approvals_are_disabled() public {
        vm.prank(organizer);
        uint256 returned = eventChain.safeMint(alice, "ipfs://a", "A", 0, block.timestamp + 1 days);

        (uint256 tokenId, bool ok) = findLatestTokenOwnedBy(alice);
        assertTrue(ok);
        assertEq(tokenId, returned);

        vm.prank(alice);
        vm.expectRevert("Approvals disabled");
        eventChain.approve(bob, returned);

        vm.prank(alice);
        vm.expectRevert("Approvals disabled");
        eventChain.setApprovalForAll(bob, true);
    }
    function test_mintedNFTAddress() public {
        // Get the EventContract's address for verification
        address expectedNFTAddress = address(eventChain);
        
        // Mint a new NFT to alice and capture the returned token ID
        vm.prank(organizer);
        uint256 tokenId = eventChain.safeMint(alice, "ipfs://test-address", "Test Event", 0.1 ether, block.timestamp + 1 days);
        
        // Verify the token exists in the EventContract
        address nftOwner = eventChain.ownerOf(tokenId);
        
        // Get the actual NFT contract address from the token ID
        try IERC721(address(eventChain)).ownerOf(tokenId) returns (address actualOwner) {
            // Verify the NFT contract address is correct
            assertEq(actualOwner, alice, "NFT owner should be alice");
            
            // Verify the token exists in the EventContract's storage
            (uint256 foundTokenId, bool ok) = findLatestTokenOwnedBy(alice);
            assertTrue(ok, "Should find the minted token in storage");
            assertEq(foundTokenId, tokenId, "Token ID mismatch in storage");
            
            // Log the verification details
            console.log("NFT verification successful");
            console.log("Token ID: ", tokenId);
            console.log("Contract address: ", expectedNFTAddress);
            console.log("Owner address: ", nftOwner);
            console.log("Alice address: ", alice);
            
            // Additional verification that the token is owned by the contract
            assertEq(
                eventChain.balanceOf(alice),
                1,
                "Alice should own exactly one token"
            );
        } catch Error(string memory reason) {
            fail(string(abi.encodePacked("Failed to verify NFT: ", reason)));
        } catch (bytes memory) {
            fail("Failed to verify NFT: Unknown error");
        }
    }
}

contract MaliciousReceiver {
    receive() external payable {
        revert("I don't want ETH");
    }
}