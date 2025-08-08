// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEventContract
 * @dev Interface for EventContract that manages ticket minting, validation, metadata updates,
 * maximum resale price settings, royalties, and burning expired tickets.
 */
interface IEventContract {

    // ------------ Minting ------------
    function safeMint(
        address to,
        string memory uri,
        string memory eventDetails,
        uint256 originalPrice,
        uint256 expirationDate
    ) external;

    // Mint with royalty receiver and bps (denominator 10000)
    function safeMintWithRoyalty(
        address to,
        string memory uri,
        string memory eventDetails,
        uint256 originalPrice,
        uint256 expirationDate,
        address royaltyReceiver,
        uint96 royaltyBps
    ) external;

    // ------------ Validation & status ------------
    function validateTicket(uint256 tokenId) external;

    function getTicketHistory(uint256 tokenId) external view returns (address[] memory);

    function getTicketStatus(uint256 tokenId) external view returns (bool isUsed, bool isValid);

    // ------------ Admin updates ------------
    function updateTicketMetadata(uint256 tokenId, string memory newEventDetails, string memory newURI) external;

    function setMaxResalePrice(uint256 tokenId, uint256 maxPrice) external;

    function burnExpiredTickets(uint256 tokenId) external;

    // ------------ Transfers ------------
    function transferWithHistoryUpdate(address from, address to, uint256 tokenId) external;

    // Royalty-enforced transfer (requires msg.value to cover royalty based on salePrice)
    function safeTransferWithRoyalty(address from, address to, uint256 tokenId, uint256 salePrice) external payable;

    // ------------ Events ------------
    event TicketMinted(uint256 indexed tokenId, address indexed owner, string eventDetails, uint256 originalPrice, uint256 expirationDate);

    event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    event TicketValidated(uint256 indexed tokenId, address indexed validator);

    event TicketExpired(uint256 indexed tokenId);

    event TicketMetadataUpdated(uint256 indexed tokenId, string newEventDetails, string newURI);

    event TicketMaxResalePriceSet(uint256 indexed tokenId, uint256 maxPrice);
}