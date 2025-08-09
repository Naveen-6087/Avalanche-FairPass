// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "./IEventContract.sol";

contract EventContract is ERC721, ERC721URIStorage, ERC721Burnable, ERC2981, Ownable, IEventContract {
    uint256 private ticketIdCounter;

    struct TicketInfo {
        string eventInfo;
        uint256 basePrice;
        uint64 expiryTimestamp;
        address[] pastOwners;
        bool usedStatus;
    }

    mapping(uint256 => TicketInfo) private ticketRecords;
    mapping(uint256 => uint256) public resalePriceLimit;

    constructor(address contractOwner) ERC721("EventChainTickets", "ECT") {
        require(contractOwner != address(0), "Invalid owner address");
        _transferOwnership(contractOwner);
    }

    function safeMint(address to, string memory uri, string memory eventDetails, uint256 originalPrice, uint256 expirationDate) external override returns (uint256) {
        uint256 newTicketId = ticketIdCounter++;
        _safeMint(to, newTicketId);
        _setTokenURI(newTicketId, uri);

        address[] memory owners = new address[](1);
        owners[0] = to;

        ticketRecords[newTicketId] = TicketInfo({
            eventInfo: eventDetails,
            basePrice: originalPrice,
            expiryTimestamp: uint64(expirationDate),
            pastOwners: owners,
            usedStatus: false
        });

        emit TicketMinted(newTicketId, to, eventDetails, originalPrice, expirationDate);
        return newTicketId;
    }

    function safeMintWithRoyalty(
        address to,
        string memory uri,
        string memory eventDetails,
        uint256 originalPrice,
        uint256 expirationDate,
        address royaltyReceiver,
        uint96 royaltyBps
    ) external override returns (uint256) {
        uint256 newTicketId = ticketIdCounter++;
        _safeMint(to, newTicketId);
        _setTokenURI(newTicketId, uri);

        address[] memory owners = new address[](1);
        owners[0] = to;

        ticketRecords[newTicketId] = TicketInfo({
            eventInfo: eventDetails,
            basePrice: originalPrice,
            expiryTimestamp: uint64(expirationDate),
            pastOwners: owners,
            usedStatus: false
        });

        if (royaltyReceiver != address(0) && royaltyBps > 0) {
            _setTokenRoyalty(newTicketId, royaltyReceiver, royaltyBps);
        }

        emit TicketMinted(newTicketId, to, eventDetails, originalPrice, expirationDate);
        return newTicketId;
    }

    function validateTicket(uint256 ticketId) public override {
        require(ownerOf(ticketId) == msg.sender, "Not authorized");
        require(!ticketRecords[ticketId].usedStatus, "Ticket already used");
        require(block.timestamp <= ticketRecords[ticketId].expiryTimestamp, "Ticket has expired");
        ticketRecords[ticketId].usedStatus = true;
        emit TicketValidated(ticketId, msg.sender);
    }

    function getTicketHistory(uint256 ticketId) public view override returns (address[] memory) {
        require(_exists(ticketId), "Nonexistent ticket");
        return ticketRecords[ticketId].pastOwners;
    }

    function getTicketStatus(uint256 ticketId) public view override returns (bool isUsed, bool isValid) {
        require(_exists(ticketId), "Nonexistent ticket");
        TicketInfo storage info = ticketRecords[ticketId];
        bool valid = block.timestamp <= info.expiryTimestamp;
        return (info.usedStatus, valid);
    }

    // Implement the missing interface functions:

    function updateTicketMetadata(
        uint256 tokenId,
        string memory newEventDetails,
        string memory newURI
    ) external override onlyOwner {
        require(_exists(tokenId), "Nonexistent ticket");
        ticketRecords[tokenId].eventInfo = newEventDetails;
        _setTokenURI(tokenId, newURI);
        emit TicketMetadataUpdated(tokenId, newEventDetails, newURI);
    }

    function setMaxResalePrice(uint256 tokenId, uint256 maxPrice) external override onlyOwner {
        require(_exists(tokenId), "Nonexistent ticket");
        resalePriceLimit[tokenId] = maxPrice;
        emit TicketMaxResalePriceSet(tokenId, maxPrice);
    }

    function burnExpiredTickets(uint256 tokenId) external override onlyOwner {
        require(_exists(tokenId), "Nonexistent ticket");
        require(block.timestamp > ticketRecords[tokenId].expiryTimestamp, "Ticket still valid");
        _burn(tokenId);
        emit TicketExpired(tokenId);
    }

    function safeTransferWithRoyalty(
        address from,
        address to,
        uint256 tokenId,
        uint256 salePrice
    ) external override payable {
        require(_exists(tokenId), "Nonexistent ticket");
        require(from != address(0) && to != address(0), "Invalid address");
        require(from == ownerOf(tokenId), "Not token owner");
        require(msg.sender == from, "Only owner can transfer");

        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, salePrice);
        require(msg.value == royaltyAmount, "Incorrect royalty");

        if (royaltyAmount > 0) {
            (bool sent, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(sent, "Royalty payment failed");
        }

        ticketRecords[tokenId].pastOwners.push(to);
        _transfer(from, to, tokenId);
        emit TicketTransferred(tokenId, from, to);
    }

    function transferWithHistoryUpdate(
        address from,
        address to,
        uint256 tokenId
    ) external override onlyOwner {
        require(_exists(tokenId), "Nonexistent ticket");
        require(from != address(0) && to != address(0), "Invalid address");
        require(from == ownerOf(tokenId), "Not token owner");

        ticketRecords[tokenId].pastOwners.push(to);
        _transfer(from, to, tokenId);
        emit TicketTransferred(tokenId, from, to);
    }

    // Helper functions
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return ERC721._ownerOf(tokenId) != address(0);
    }


    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete ticketRecords[tokenId];
        delete resalePriceLimit[tokenId];
        _resetTokenRoyalty(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Resolve override conflict between ERC2981 and IEventContract
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        override(ERC2981, IEventContract)
        returns (address, uint256)
    {
        return super.royaltyInfo(tokenId, salePrice);
    }

    function approve(address /* to */, uint256 /* tokenId */) public pure override(ERC721, IERC721) {
        revert("Approvals disabled");
    }

    function setApprovalForAll(address /* operator */, bool /* approved */) public pure override(ERC721, IERC721) {
        revert("Approvals disabled");
    } 
}

//0x7087374beB22f3021096542F0dF409062522db0b
