import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Tag, User, Ticket } from 'lucide-react';
import { fetchMetadata } from '@/lib/pinata';

export default function EventCard({ event, onBuyTicket, onViewDetails }) {
  const [metadata, setMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch metadata when component mounts or event changes
  useEffect(() => {
    const loadMetadata = async () => {
      if (!event.metadataURI) {
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
  }, [event.metadataURI]);

  const formatPrice = (priceWei) => {
    const priceEth = Number(priceWei) / 1e18;
    return priceEth > 0.001 ? `${priceEth.toFixed(4)} ETH` : `${priceWei} Wei`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Concert': 'bg-purple-500',
      'Movie': 'bg-blue-500',
      'Sports': 'bg-green-500',
      'Conference': 'bg-yellow-500',
      'Workshop': 'bg-orange-500',
      'Party': 'bg-pink-500',
      'Exhibition': 'bg-indigo-500',
      'Other': 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {isLoadingMetadata ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={event.name || metadata?.name || 'Event'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load image:', imageUrl);
              e.target.src = 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Event+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Ticket className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Event Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${getEventTypeColor(event.type || metadata?.attributes?.find(attr => attr.trait_type === 'Event Type')?.value)} text-white text-xs font-medium px-2 py-1 rounded-full`}>
            {event.type || metadata?.attributes?.find(attr => attr.trait_type === 'Event Type')?.value || 'Event'}
          </span>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full">
            {formatPrice(event.ticketPrice)}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {event.name || metadata?.name || 'Untitled Event'}
        </h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description || metadata?.description || 'No description available'}
        </p>

        {/* Event Info Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-300">
            <MapPin className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm">{event.location || metadata?.attributes?.find(attr => attr.trait_type === 'Location')?.value || 'Location TBD'}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-sm">{formatDate(event.date || metadata?.attributes?.find(attr => attr.trait_type === 'Date')?.value || new Date())}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <User className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm">Organized by {event.organizer?.slice(0, 6)}...{event.organizer?.slice(-4) || 'Unknown'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onBuyTicket(event)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Ticket className="inline w-4 h-4 mr-2" />
            Buy Ticket
          </button>
          
          <button
            onClick={() => onViewDetails(event)}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
