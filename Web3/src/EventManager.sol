// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IEventContract.sol";
import "./IEventManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventManager
 * @dev This contract allows organizers to create events, mint tickets, and transfer event ownership.
 *      The contract is managed by the owner who also controls the address of the EventChainContract.
 */
contract EventManager is Ownable, IEventManager {

    uint256 private eventIdCounter; // Counter to assign unique IDs to events

    mapping(uint256 => Event) private eventRegistry; // Maps each event ID to its details

    address private eventChainContract; // Stores the address of the EventChainContract

    /**
     * @dev Constructor to initialize the contract with an owner and the linked EventChainContract.
     * @param initialOwner The initial owner of the contract.
     * @param eventChainContractAddress The address of the EventChainContract to be used.
     */
    constructor(address initialOwner, address eventChainContractAddress)
        Ownable(initialOwner)
    {
        eventChainContract = eventChainContractAddress;
    }

    /**
     * @dev Allows the contract owner to update the EventChainContract address.
     * @param newEventChainContract The new EventChainContract address to be set.
     */
    function setEventChainAddress(address newEventChainContract) external onlyOwner {
        eventChainContract = newEventChainContract;
    }

    /**
     * @dev Organizer can create a new event by providing event details.
     * @param name The name of the event.
     * @param location The venue or place of the event.
     * @param date The scheduled date of the event.
     * @param ticketPrice The cost of one ticket for the event.
     */
    function createEvent(string memory name, string memory location, string memory date, uint256 ticketPrice) public override {
        uint256 eventId = eventIdCounter;
        eventIdCounter += 1;

        eventRegistry[eventId] = Event({
            name: name,
            location: location,
            date: date,
            ticketPrice: ticketPrice,
            organizer: msg.sender
        });

        emit EventCreated(eventId, name, location, date, ticketPrice, msg.sender);
    }

    /**
     * @dev Fetches the details of an existing event.
     * @param eventId The ID of the event to query.
     * @return Event struct containing all event metadata.
     */
    function getEventDetails(uint256 eventId) public view override returns (Event memory) {
        require(eventId < eventIdCounter, "Event does not exist");
        return eventRegistry[eventId];
    }

    /**
     * @dev Allows the event organizer to mint tickets for a specific event.
     * @param eventId The ID of the event to mint tickets for.
     * @param to The address receiving the minted ticket.
     * @param uri The metadata URI associated with the ticket.
     * @param endDate The end date for the ticket's validity.
     * @return The address of the ticket holder.
     */
    function mintTicket(uint256 eventId, address to, string memory uri, uint256 endDate) public override returns (uint256) {
        require(eventId < eventIdCounter, "Event does not exist");
        require(eventRegistry[eventId].organizer == msg.sender, "Only organizer can mint");
        require(eventChainContract != address(0), "EventChainContract not set");
        require(address(this).balance == 0, "Cannot mint with pending balance");

        IEventContract chain = IEventContract(eventChainContract);
        // default royalty 100 bps = 1%
        uint256 tokenId = chain.safeMintWithRoyalty(
            to,
            uri,
            eventRegistry[eventId].name,
            eventRegistry[eventId].ticketPrice,
            endDate,
            msg.sender,
            100
        );
        return tokenId;
    }

    /**
     * @dev Allows the current owner of an event to transfer ownership to another address.
     * @param eventId The ID of the event to transfer.
     * @param to The new organizer's address.
     */
    function transferEvent(uint256 eventId, address to) external {
        Event storage currentEvent = eventRegistry[eventId];
        require(currentEvent.organizer == msg.sender, "Only organizer can transfer");

        currentEvent.organizer = to;
        emit EventTransferred(eventId, msg.sender, to);
    }
}
//0xE37e93Dadb4e72b89885A1fDC85ec1ae527e73eE