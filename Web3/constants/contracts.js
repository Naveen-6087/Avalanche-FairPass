// Contract addresses on Avalanche Fuji testnet (chainId: 43113)
const CONTRACTS = {
  // Network configuration
  NETWORK: {
    name: "Avalanche Fuji Testnet",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorerUrl: "https://testnet.snowtrace.io"
  },

  // Contract addresses from the latest deployment
  ADDRESSES: {
    EVENT_CONTRACT: "0xfB65e1bBCD243F272A8583aD9ed16BD73f6E0ee9",
    EVENT_MANAGER: "0x8c38812EC0cFEDDd88866715F602bf3502764f90",
    MARKETPLACE: "0x10D05Fe23f96a990B022a610f81A4a33a9d75E4E"
  },

  // Contract ABIs
  ABI: {
    // EventContract ABI
    EVENT_CONTRACT: [
      // ERC721 standard functions
      "function name() view returns (string memory)",
      "function symbol() view returns (string memory)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)",
      "function safeTransferFrom(address from, address to, uint256 tokenId)",
      "function approve(address to, uint256 tokenId)",
      "function setApprovalForAll(address operator, bool approved)",
      
      // Event-specific functions
      "function createEvent(string memory name, string memory symbol, string memory uri, uint256 maxSupply, uint256 price, uint256 startTime, uint256 endTime, address payable beneficiary) external returns (address)",
      "function getEventContract(uint256 eventId) external view returns (address)",
      "function getEventDetails(uint256 eventId) external view returns (string memory, string memory, string memory, uint256, uint256, uint256, uint256, address)",
      
      // Events
      "event EventCreated(uint256 indexed eventId, address indexed eventContract, string name, string symbol, address creator)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ],

    // EventManager ABI
    EVENT_MANAGER: [
      "function setEventChainAddress(address _eventContract) external",
      "function createEvent(string memory name, string memory symbol, string memory uri, uint256 maxSupply, uint256 price, uint256 startTime, uint256 endTime, address payable beneficiary) external returns (address)",
      "function getEventContract(uint256 eventId) external view returns (address)",
      "function getEventDetails(uint256 eventId) external view returns (string memory, string memory, string memory, uint256, uint256, uint256, uint256, address)",
      "function owner() view returns (address)",
      "function transferOwnership(address newOwner) external",
      "event EventCreated(uint256 indexed eventId, address indexed eventContract, string name, string symbol, address creator)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ],

    // Marketplace ABI
    MARKETPLACE: [
      // Core functions
      "function listTicket(address nftContract, uint256 tokenId, uint256 price) external",
      "function cancelListing(address nftContract, uint256 tokenId) external",
      "function buyTicket(address nftContract, uint256 tokenId) external payable",
      "function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice) external",
      "function withdrawFunds() external",
      "function setMarketplaceFee(uint256 _fee) external",
      "function setMarketplaceOwner(address _owner) external",
      
      // View functions
      "function getListing(address nftContract, uint256 tokenId) external view returns (address seller, uint256 price, bool isActive)",
      "function marketplaceFee() external view returns (uint256)",
      "function marketplaceOwner() external view returns (address)",
      "function owner() view returns (address)",
      
      // Events
      "event TicketListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price)",
      "event TicketSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price)",
      "event ListingCancelled(address indexed seller, address indexed nftContract, uint256 indexed tokenId)",
      "event ListingPriceUpdated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 newPrice)",
      "event FundsWithdrawn(address indexed owner, uint256 amount)",
      "event MarketplaceFeeUpdated(uint256 newFee)",
      "event MarketplaceOwnerUpdated(address newOwner)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ]
  }
};

// Export the constants
export default CONTRACTS;
