import React, { useState, useEffect } from 'react';
import { useBuyTicket, useTransactionStatus, useUserConnection, useCurrentChain, useChainSwitcher } from '@/lib/connections';
import { CalendarIcon, MapPinIcon, DollarSignIcon, Wallet, AlertCircle } from 'lucide-react';
import { fetchMetadata } from '@/lib/pinata';

export default function TicketPurchase({ event }) {
  const [ticketId, setTicketId] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const { address, isConnected, isConnecting } = useUserConnection();
  const { chainId, isAvalancheFuji } = useCurrentChain();
  const { switchToAvalancheFuji, isPending: isSwitching } = useChainSwitcher();
  
  const { buyTicket, hash, isPending, error } = useBuyTicket();
  const { isSuccess, isError } = useTransactionStatus(hash);

  // Fetch metadata when component mounts or event changes
  useEffect(() => {
    const loadMetadata = async () => {
      if (!event?.metadataURI) {
        setImageUrl(null);
        setMetadata(null);
        return;
      }

      setIsLoadingMetadata(true);
      try {
        const fetchedMetadata = await fetchMetadata(event.metadataURI);
        setMetadata(fetchedMetadata);
        
        if (fetchedMetadata?.image) {
          // Convert ipfs:// URI to gateway URL for the image
          const imageGatewayUrl = fetchedMetadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
          setImageUrl(imageGatewayUrl);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Error loading event metadata:', error);
        setImageUrl(null);
        setMetadata(null);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [event?.metadataURI]);

  // Monitor transaction status
  useEffect(() => {
    if (isSuccess) {
      alert('Ticket purchased successfully! Check your wallet for the NFT.');
    }
    if (isError) {
      alert('Transaction failed. Please check your wallet and try again.');
    }
  }, [isSuccess, isError]);

  const handleBuyTicket = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!isAvalancheFuji) {
      alert('Please switch to Avalanche Fuji testnet.');
      return;
    }

    if (!event) {
      alert('No event selected.');
      return;
    }

    try {
      const tokenURI = "https://your-ticket-metadata-placeholder.com/ticket.json";
      let priceOverride;
      
      if (event.ticketPrice) {
        // Convert the stored ticketPrice to BigInt
        priceOverride = BigInt(event.ticketPrice);
      }
      
      await buyTicket(event.id, tokenURI, priceOverride);
    } catch (error) {
      console.error('Error buying ticket:', error);
      alert('Error buying ticket. Check console for details.');
    }
  };

  const handleConnectWallet = () => {
    // This will be handled by the ConnectButton component in the navbar
    alert('Please use the Connect Wallet button in the navigation bar.');
  };

  const handleSwitchChain = async () => {
    try {
      await switchToAvalancheFuji();
    } catch (error) {
      console.error('Error switching chain:', error);
      alert('Failed to switch to Avalanche Fuji. Please switch manually in your wallet.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Event Image */}
      {event?.metadataURI && (
        <div className="w-full h-48 overflow-hidden">
          {isLoadingMetadata ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={event.name || metadata?.name || "Event"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', imageUrl);
                e.target.src = 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Event+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">🎫</div>
                <div className="text-sm">Event Image</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Details & Purchase Options */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">
          {event?.name || metadata?.name || "Purchase NFT Ticket"}
        </h2>

        {event && (
          <>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarIcon className="w-4 h-4" />
                <span>{event.date || metadata?.attributes?.find(attr => attr.trait_type === 'Date')?.value || "Date not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPinIcon className="w-4 h-4" />
                <span>{event.location || metadata?.attributes?.find(attr => attr.trait_type === 'Location')?.value || "Location not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <DollarSignIcon className="w-4 h-4" />
                <span>{event.ticketPrice ? `${event.ticketPrice} Wei` : "Price not specified"}</span>
              </div>
            </div>

            {(event.description || metadata?.description) && (
              <p className="text-gray-300 mb-6">{event.description || metadata?.description}</p>
            )}
          </>
        )}

        {/* Connection Status */}
        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <span>Wallet not connected</span>
            </div>
            <button
              onClick={handleConnectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </div>
        ) : !isAvalancheFuji ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <span>Wrong network. Please switch to Avalanche Fuji testnet.</span>
            </div>
            <button
              onClick={handleSwitchChain}
              disabled={isSwitching}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSwitching ? 'Switching...' : 'Switch to Avalanche Fuji'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleBuyTicket}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? 'Processing...' : 'Buy Ticket'}
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
