import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useReadContracts,
  useBalance,
  useChainId,
  useSwitchChain
} from 'wagmi';
import { 
  EVENT_MANAGER_ABI, 
  EVENT_CONTRACT_ABI, 
  MARKETPLACE_ABI 
} from './constants';
import { 
  EVENT_MANAGER_ADDRESS, 
  EVENT_CONTRACT_ADDRESS, 
  MARKETPLACE_ADDRESS 
} from './constants';
import { parseEther, formatEther } from 'viem';

// Hook for creating events
export function useCreateEvent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const createEvent = async (eventData) => {
    const { name, location, date, ticketPrice, metadataURI, description } = eventData;
    
    try {
      await writeContract({
        address: EVENT_MANAGER_ADDRESS,
        abi: EVENT_MANAGER_ABI,
        functionName: 'createEvent',
        args: [name, location, date, parseEther(ticketPrice.toString()), metadataURI],
      });
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  return {
    createEvent,
    hash,
    isPending,
    error,
  };
}

// Hook for buying tickets
export function useBuyTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const buyTicket = async (eventId, tokenURI, priceOverride) => {
    try {
      await writeContract({
        address: EVENT_CONTRACT_ADDRESS,
        abi: EVENT_CONTRACT_ABI,
        functionName: 'buyTicket',
        args: [eventId, tokenURI],
        value: priceOverride || 0n,
      });
    } catch (err) {
      console.error('Error buying ticket:', err);
      throw err;
    }
  };

  return {
    buyTicket,
    hash,
    isPending,
    error,
  };
}

// Hook for getting event details
export function useEventDetails(eventId) {
  const { data: eventDetails, isLoading, error } = useReadContract({
    address: EVENT_MANAGER_ADDRESS,
    abi: EVENT_MANAGER_ABI,
    functionName: 'getEventDetails',
    args: [eventId],
  });

  return {
    eventDetails,
    isLoading,
    error,
  };
}

// Hook for getting all events
export function useAllEvents() {
  const { data: events, isLoading, error } = useReadContract({
    address: EVENT_MANAGER_ADDRESS,
    abi: EVENT_MANAGER_ABI,
    functionName: 'getAllEvents',
  });

  return {
    events,
    isLoading,
    error,
  };
}

// Hook for getting user's tickets
export function useUserTickets(userAddress) {
  const { data: tickets, isLoading, error } = useReadContract({
    address: EVENT_CONTRACT_ADDRESS,
    abi: EVENT_CONTRACT_ABI,
    functionName: 'getUserTickets',
    args: [userAddress],
  });

  return {
    tickets,
    isLoading,
    error,
  };
}

// Hook for ticket validation/burning
export function useValidateTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const validateTicket = async (ticketId) => {
    try {
      await writeContract({
        address: EVENT_CONTRACT_ADDRESS,
        abi: EVENT_CONTRACT_ABI,
        functionName: 'validateTicket',
        args: [ticketId],
      });
    } catch (err) {
      console.error('Error validating ticket:', err);
      throw err;
    }
  };

  return {
    validateTicket,
    hash,
    isPending,
    error,
  };
}

// Hook for listing tickets on marketplace
export function useListTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const listTicket = async (ticketId, price) => {
    try {
      await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listTicket',
        args: [ticketId, parseEther(price.toString())],
      });
    } catch (err) {
      console.error('Error listing ticket:', err);
      throw err;
    }
  };

  return {
    listTicket,
    hash,
    isPending,
    error,
  };
}

// Hook for buying tickets from marketplace
export function useBuyFromMarketplace() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const buyFromMarketplace = async (listingId) => {
    try {
      await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyTicket',
        args: [listingId],
      });
    } catch (err) {
      console.error('Error buying from marketplace:', err);
      throw err;
    }
  };

  return {
    buyFromMarketplace,
    hash,
    isPending,
    error,
  };
}

// Hook for getting marketplace listings
export function useMarketplaceListings() {
  const { data: listings, isLoading, error } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getAllListings',
  });

  return {
    listings,
    isLoading,
    error,
  };
}

// Hook for getting user's marketplace listings
export function useUserMarketplaceListings(userAddress) {
  const { data: listings, isLoading, error } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserListings',
    args: [userAddress],
  });

  return {
    listings,
    isLoading,
    error,
  };
}

// Hook for canceling marketplace listings
export function useCancelListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const cancelListing = async (listingId) => {
    try {
      await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [listingId],
      });
    } catch (err) {
      console.error('Error canceling listing:', err);
      throw err;
    }
  };

  return {
    cancelListing,
    hash,
    isPending,
    error,
  };
}

// Hook for getting user balance
export function useUserBalance(address) {
  const { data: balance, isLoading, error } = useBalance({
    address,
  });

  return {
    balance,
    isLoading,
    error,
  };
}

// Hook for checking if user is connected
export function useUserConnection() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  
  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
  };
}

// Hook for getting current chain ID
export function useCurrentChain() {
  const chainId = useChainId();
  
  return {
    chainId,
    isAvalancheFuji: chainId === 43113, // Avalanche Fuji testnet
  };
}

// Hook for switching chains
export function useChainSwitcher() {
  const { switchChain, isPending, error } = useSwitchChain();
  
  const switchToAvalancheFuji = async () => {
    try {
      await switchChain({
        chainId: 43113, // Avalanche Fuji testnet
      });
    } catch (err) {
      console.error('Error switching to Avalanche Fuji:', err);
      throw err;
    }
  };

  return {
    switchToAvalancheFuji,
    isPending,
    error,
  };
}

// Helper function to parse metadata from metadataURI (similar to your TicketPage)
export function parseMetadata(metadataURI) {
  try {
    const url = new URL(metadataURI);
    return {
      title: url.searchParams.get("title") || "Untitled Event",
      desc: url.searchParams.get("desc") || "No Description",
      date: url.searchParams.get("date") || "N/A",
      location: url.searchParams.get("location") || "N/A",
      image: url.searchParams.get("image") || "",
    };
  } catch (error) {
    return {
      title: "Untitled Event",
      desc: "No Description",
      date: "N/A",
      location: "N/A",
      image: "",
    };
  }
}

// Hook for waiting for transaction receipt
export function useTransactionStatus(hash) {
  const { data: receipt, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    receipt,
    isLoading,
    isSuccess,
    isError,
  };
}
