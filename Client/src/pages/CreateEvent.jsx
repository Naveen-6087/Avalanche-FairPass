import { useState, useEffect } from 'react';
import { useCreateEvent, useTransactionStatus } from '@/lib/connections';
import { pinFile, pinJSON } from '@/lib/pinata';
import ImageUploader from '@/components/ImageUploader';
import { Calendar, MapPin, DollarSign, Tag, FileText, Plus } from 'lucide-react';

export default function CreateEvent() {
  const [form, setForm] = useState({ 
    name: '', 
    location: '', 
    date: '', 
    price: '', 
    type: '', 
    description: '' 
  });
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createEvent, hash, isPending, error } = useCreateEvent();
  const { isSuccess, isError } = useTransactionStatus(hash);

  // Monitor transaction status
  useEffect(() => {
    if (isSuccess) {
      alert('Transaction confirmed! Event created successfully on the blockchain.');
    }
    if (isError) {
      alert('Transaction failed. Please check your wallet and try again.');
    }
  }, [isSuccess, isError]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      alert('Please select an image for the event');
      return;
    }

    setIsUploading(true);
    
    try {
      // 1) Upload image to IPFS
      const imageUri = await pinFile(image);
      
      // 2) Build metadata
      const metadata = {
        name: form.name,
        description: form.description,
        image: imageUri,
        attributes: [
          { trait_type: 'Location', value: form.location },
          { trait_type: 'Date', value: form.date },
          { trait_type: 'Event Type', value: form.type },
          { trait_type: 'Price (Wei)', value: String(form.price) },
        ],
      };
      
      // 3) Upload metadata to IPFS
      const metadataURI = await pinJSON(metadata);
      
      // 4) Call smart contract using our custom hook
      await createEvent({
        name: form.name,
        location: form.location,
        date: form.date,
        ticketPrice: form.price,
        metadataURI: metadataURI,
        description: form.description
      });
      
      // 5) Reset form
      setForm({ name: '', location: '', date: '', price: '', type: '', description: '' });
      setImage(null);
      
      alert('Event created successfully! Check your transaction hash: ' + hash);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isPending || isUploading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create New Event</h1>
            <p className="text-gray-300">Set up your event and start selling NFT tickets</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">
                <strong>Error:</strong> {error.message || 'Failed to create event. Please try again.'}
              </p>
            </div>
          )}

          {/* Success Display */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">
                <strong>Success!</strong> Event created successfully on the blockchain.
                {hash && (
                  <span className="block mt-1 text-xs">
                    Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
                  </span>
                )}
              </p>
            </div>
          )}
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="name"
                    placeholder="Enter event title"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* Location and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="location"
                    placeholder="Event location"
                    value={form.location}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* Event Type and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Tag className="inline w-4 h-4 mr-2" />
                    Event Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="type"
                    value={form.type}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="Concert">Concert</option>
                    <option value="Movie">Movie</option>
                    <option value="Sports">Sports</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Party">Party</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Ticket Price (Wei) <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.price}
                    onChange={onChange}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter price in Wei (1 ETH = 10^18 Wei)</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  name="description"
                  placeholder="Describe your event..."
                  rows="4"
                  value={form.description}
                  onChange={onChange}
                  required
                />
              </div>

              {/* Image Upload */}
              <ImageUploader onImageSelect={setImage} required />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isUploading ? 'Uploading to IPFS...' : 'Creating Event...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


