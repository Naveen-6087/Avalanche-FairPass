# Wagmi Hooks for FairPass DApp

This file contains custom Wagmi hooks for interacting with the FairPass smart contracts on Avalanche Fuji testnet.

## Available Hooks

### Event Management

#### `useCreateEvent()`
Creates a new event on the blockchain.

```javascript
import { useCreateEvent } from '@/lib/connections';

const { createEvent, hash, isPending, error } = useCreateEvent();

const handleCreateEvent = async () => {
  await createEvent({
    name: "Concert Night",
    location: "Music Hall",
    date: "2024-12-25",
    ticketPrice: "1000000000000000000", // 1 ETH in Wei
    metadataURI: "ipfs://...",
    description: "Amazing concert event"
  });
};
```

#### `useEventDetails(eventId)`
Gets details of a specific event.

```javascript
const { eventDetails, isLoading, error } = useEventDetails(1);
```

#### `useAllEvents()`
Gets all events from the blockchain.

```javascript
const { events, isLoading, error } = useAllEvents();
```

### Ticket Management

#### `useBuyTicket()`
Purchases a ticket for an event.

```javascript
const { buyTicket, hash, isPending, error } = useBuyTicket();

const handleBuyTicket = async () => {
  await buyTicket(eventId, tokenURI, priceOverride);
};
```

#### `useUserTickets(userAddress)`
Gets all tickets owned by a user.

```javascript
const { tickets, isLoading, error } = useUserTickets(userAddress);
```

#### `useValidateTicket()`
Validates/burns a ticket after event attendance.

```javascript
const { validateTicket, hash, isPending, error } = useValidateTicket();

const handleValidateTicket = async () => {
  await validateTicket(ticketId);
};
```

### Marketplace

#### `useListTicket()`
Lists a ticket for sale on the marketplace.

```javascript
const { listTicket, hash, isPending, error } = useListTicket();

const handleListTicket = async () => {
  await listTicket(ticketId, price);
};
```

#### `useBuyFromMarketplace()`
Buys a ticket from the marketplace.

```javascript
const { buyFromMarketplace, hash, isPending, error } = useBuyFromMarketplace();

const handleBuyFromMarketplace = async () => {
  await buyFromMarketplace(listingId);
};
```

#### `useMarketplaceListings()`
Gets all marketplace listings.

```javascript
const { listings, isLoading, error } = useMarketplaceListings();
```

#### `useUserMarketplaceListings(userAddress)`
Gets marketplace listings by a specific user.

```javascript
const { listings, isLoading, error } = useUserMarketplaceListings(userAddress);
```

#### `useCancelListing()`
Cancels a marketplace listing.

```javascript
const { cancelListing, hash, isPending, error } = useCancelListing();

const handleCancelListing = async () => {
  await cancelListing(listingId);
};
```

### Wallet & Network

#### `useUserConnection()`
Gets wallet connection status.

```javascript
const { address, isConnected, isConnecting, isDisconnected } = useUserConnection();
```

#### `useUserBalance(address)`
Gets user's token balance.

```javascript
const { balance, isLoading, error } = useUserBalance(address);
```

#### `useCurrentChain()`
Gets current chain information.

```javascript
const { chainId, isAvalancheFuji } = useCurrentChain();
```

#### `useChainSwitcher()`
Switches to Avalanche Fuji testnet.

```javascript
const { switchToAvalancheFuji, isPending, error } = useChainSwitcher();

const handleSwitchChain = async () => {
  await switchToAvalancheFuji();
};
```

### Transaction Status

#### `useTransactionStatus(hash)`
Monitors transaction status.

```javascript
const { receipt, isLoading, isSuccess, isError } = useTransactionStatus(hash);
```

## Usage Examples

### Complete Event Creation Flow

```javascript
import { useCreateEvent, useTransactionStatus } from '@/lib/connections';

function CreateEventForm() {
  const { createEvent, hash, isPending, error } = useCreateEvent();
  const { isSuccess, isError } = useTransactionStatus(hash);

  const handleSubmit = async (eventData) => {
    try {
      await createEvent(eventData);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      alert('Event created successfully!');
    }
    if (isError) {
      alert('Transaction failed!');
    }
  }, [isSuccess, isError]);

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
```

### Ticket Purchase with Wallet Check

```javascript
import { useBuyTicket, useUserConnection, useCurrentChain } from '@/lib/connections';

function TicketPurchase({ event }) {
  const { isConnected } = useUserConnection();
  const { isAvalancheFuji } = useCurrentChain();
  const { buyTicket, isPending } = useBuyTicket();

  const handleBuyTicket = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isAvalancheFuji) {
      alert('Please switch to Avalanche Fuji testnet');
      return;
    }

    await buyTicket(event.id, tokenURI, event.ticketPrice);
  };

  return (
    <button 
      onClick={handleBuyTicket}
      disabled={!isConnected || !isAvalancheFuji || isPending}
    >
      {isPending ? 'Processing...' : 'Buy Ticket'}
    </button>
  );
}
```

## Error Handling

All hooks return an `error` object that contains error information:

```javascript
const { error } = useCreateEvent();

if (error) {
  console.error('Error:', error.message);
  // Display error to user
}
```

## Loading States

Most hooks provide loading states:

```javascript
const { isLoading, isPending } = useSomeHook();

// isLoading: for read operations
// isPending: for write operations
```

## Transaction Monitoring

For write operations, use the `hash` and `useTransactionStatus`:

```javascript
const { createEvent, hash } = useCreateEvent();
const { isSuccess, isError } = useTransactionStatus(hash);

useEffect(() => {
  if (isSuccess) {
    // Transaction confirmed
  }
  if (isError) {
    // Transaction failed
  }
}, [isSuccess, isError]);
```

## Network Requirements

- **Chain ID**: 43113 (Avalanche Fuji testnet)
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io

## Dependencies

- `wagmi`: React hooks for Ethereum
- `viem`: Ethereum TypeScript interface
- `@/lib/constants`: Contract addresses and ABIs
