// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "./IEventContract.sol";

/**
 * @title EventTicketMarketplace
 * @dev Marketplace for trading event ticket NFTs with royalty support
 */
contract Marketplace is Ownable, ReentrancyGuard {
    
    // Marketplace fee in basis points (100 = 1%)
    uint256 public marketplaceFee = 250; // 2.5% default
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Listing structure
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 listingTime;
    }
    
    // Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId = 1;
    
    // Mapping from tokenId to listing ID (for quick lookup)
    mapping(uint256 => uint256) public tokenToListingId;
    
    // Events
    event TicketListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event ListingUpdated(uint256 indexed listingId, uint256 indexed tokenId, uint256 newPrice);
    event MarketplaceFeeUpdated(uint256 newFee);
    
    // Event contract interface
    IEventContract public eventContract;
    
    constructor(address _eventContract, address _owner) {
        require(_eventContract != address(0), "Invalid event contract address");
        _transferOwnership(_owner);
        eventContract = IEventContract(_eventContract);
    }
    
    /**
     * @dev List a ticket for sale
     * @param tokenId The token ID to list
     * @param price The sale price in wei
     */
    function listTicket(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(address(eventContract)).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(address(eventContract)).getApproved(tokenId) == address(this) || 
                IERC721(address(eventContract)).isApprovedForAll(msg.sender, address(this)), 
                "Marketplace not approved");
        require(tokenToListingId[tokenId] == 0, "Token already listed");
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            active: true,
            listingTime: block.timestamp
        });
        
        tokenToListingId[tokenId] = listingId;
        
        emit TicketListed(listingId, tokenId, msg.sender, price);
    }
    
    /**
     * @dev Purchase a listed ticket
     * @param listingId The listing ID to purchase
     */
    function purchaseTicket(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        
        // Calculate fees
        uint256 marketplaceFeeAmount = (listing.price * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = listing.price - marketplaceFeeAmount;
        
        // Get royalty info from the token
        (address royaltyReceiver, uint256 royaltyAmount) = eventContract.royaltyInfo(listing.tokenId, listing.price);
        
        // Adjust seller amount if royalty is higher than marketplace fee
        if (royaltyAmount > marketplaceFeeAmount) {
            uint256 additionalRoyalty = royaltyAmount - marketplaceFeeAmount;
            sellerAmount -= additionalRoyalty;
        }
        
        // Transfer the token
        IERC721(address(eventContract)).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Distribute payments
        if (sellerAmount > 0) {
            (bool sellerSent, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerSent, "Failed to send payment to seller");
        }
        
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltySent, "Failed to send royalty");
        }
        
        // Keep marketplace fee
        if (marketplaceFeeAmount > 0) {
            (bool feeSent, ) = payable(owner()).call{value: marketplaceFeeAmount}("");
            require(feeSent, "Failed to send marketplace fee");
        }
        
        // Update listing
        listing.active = false;
        delete tokenToListingId[listing.tokenId];
        
        emit TicketSold(listingId, listing.tokenId, msg.sender, listing.price);
    }
    
    /**
     * @dev Cancel a listing (only by seller)
     * @param listingId The listing ID to cancel
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Only seller can cancel");
        
        listing.active = false;
        delete tokenToListingId[listing.tokenId];
        
        emit ListingCancelled(listingId, listing.tokenId, msg.sender);
    }
    
    /**
     * @dev Update listing price (only by seller)
     * @param listingId The listing ID to update
     * @param newPrice The new price
     */
    function updateListingPrice(uint256 listingId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than 0");
        
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Only seller can update");
        
        listing.price = newPrice;
        
        emit ListingUpdated(listingId, listing.tokenId, newPrice);
    }
    
    /**
     * @dev Get listing details
     * @param listingId The listing ID
     * @return seller The seller address
     * @return tokenId The token ID
     * @return price The listing price
     * @return active Whether the listing is active
     * @return listingTime The listing timestamp
     */
    function getListing(uint256 listingId) external view returns (
        address seller,
        uint256 tokenId,
        uint256 price,
        bool active,
        uint256 listingTime
    ) {
        Listing storage listing = listings[listingId];
        return (listing.seller, listing.tokenId, listing.price, listing.active, listing.listingTime);
    }
    
    /**
     * @dev Get listing ID for a token
     * @param tokenId The token ID
     * @return The listing ID (0 if not listed)
     */
    function getListingIdForToken(uint256 tokenId) external view returns (uint256) {
        return tokenToListingId[tokenId];
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     * @param newFee The new fee in basis points
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }
    
    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Failed to withdraw fees");
    }
    
    /**
     * @dev Emergency function to cancel listing (only owner)
     * @param listingId The listing ID to cancel
     */
    function emergencyCancelListing(uint256 listingId) external onlyOwner {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        
        listing.active = false;
        delete tokenToListingId[listing.tokenId];
        
        emit ListingCancelled(listingId, listing.tokenId, listing.seller);
    }
    
    /**
     * @dev Update event contract address (only owner)
     * @param newEventContract The new event contract address
     */
    function updateEventContract(address newEventContract) external onlyOwner {
        require(newEventContract != address(0), "Invalid address");
        eventContract = IEventContract(newEventContract);
    }
    
    /**
     * @dev Get total fees for a purchase
     * @param listingId The listing ID
     * @return marketplaceFeeAmount The marketplace fee amount
     * @return royaltyAmount The royalty amount
     * @return sellerAmount The amount seller receives
     */
    function getPurchaseBreakdown(uint256 listingId) external view returns (
        uint256 marketplaceFeeAmount,
        uint256 royaltyAmount,
        uint256 sellerAmount
    ) {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        
        marketplaceFeeAmount = (listing.price * marketplaceFee) / FEE_DENOMINATOR;
        (address royaltyReceiver, uint256 royalty) = eventContract.royaltyInfo(listing.tokenId, listing.price);
        royaltyAmount = royalty;
        
        sellerAmount = listing.price - marketplaceFeeAmount;
        if (royaltyAmount > marketplaceFeeAmount) {
            uint256 additionalRoyalty = royaltyAmount - marketplaceFeeAmount;
            sellerAmount -= additionalRoyalty;
        }
        
        return (marketplaceFeeAmount, royaltyAmount, sellerAmount);
    }
    
    // Required for receiving ETH
    receive() external payable {
        revert("Direct payments not accepted");
    }
}