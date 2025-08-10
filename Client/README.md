# FairPass Client - Event Management DApp

A React-based frontend for the FairPass decentralized event management and NFT ticketing system.

## Features

- **Event Creation**: Create events with title, date, location, type, price, description, and image
- **Image Upload**: Drag-and-drop image upload with IPFS integration via Pinata
- **NFT Ticketing**: Purchase tickets as NFTs for events
- **Marketplace**: Secondary marketplace for ticket trading
- **IPFS Storage**: All event images and metadata stored on IPFS

## Image Upload Functionality

The application includes a comprehensive image upload system that integrates with Pinata IPFS:

### Components

1. **ImageUploader** (`/src/components/ImageUploader.jsx`)
   - Drag-and-drop interface
   - Image preview
   - File validation
   - Responsive design

### How It Works

1. **Image Selection**: Users can select images via file picker or drag-and-drop
2. **IPFS Upload**: Images are uploaded to IPFS using Pinata API
3. **Metadata Creation**: Event metadata is created and also uploaded to IPFS
4. **Smart Contract Integration**: Both URIs are used when creating events

### Environment Variables

Make sure to set these in your `.env` file:

```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Pinata account with API keys

### Installation

1. Clone the repository
2. Navigate to the Client directory:
   ```bash
   cd Client
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with your Pinata credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

### Available Routes

- `/` - Landing page with comprehensive feature overview
- `/create` - Create new events
- `/events` - View your events
- `/marketplace` - Ticket marketplace

## Usage

### Creating an Event

1. Navigate to `/create`
2. Fill in event details (title, date, location, type, price, description)
3. Upload an image using the drag-and-drop interface
4. Submit the form to create the event on the blockchain

## Technical Details

### Dependencies

- **React 19** with Vite for fast development
- **Tailwind CSS** for styling
- **Wagmi + Viem** for blockchain interaction
- **Lucide React** for icons
- **Axios** for HTTP requests to Pinata

### File Structure

```
src/
├── components/
│   ├── ImageUploader.jsx      # Main image upload component
│   ├── EventCard.jsx          # Event display component
│   └── Navbar.jsx             # Navigation component
├── lib/
│   ├── constants.js           # Contract ABIs and addresses
│   └── pinata.js             # Pinata IPFS integration
├── pages/
│   ├── CreateEvent.jsx        # Event creation page
│   ├── Landing.jsx            # Enhanced landing page
│   ├── MyEvents.jsx           # User's events
│   └── Marketplace.jsx        # Ticket marketplace
└── App.jsx                    # Main app component
```

### IPFS Integration

The application uses Pinata for IPFS pinning:

- **Image Upload**: `pinFile()` function uploads images to IPFS
- **Metadata Upload**: `pinJSON()` function uploads event metadata
- **Gateway Access**: Images are accessible via Pinata's IPFS gateway

## Development

### Adding New Features

1. Create components in `/src/components/`
2. Add routes in `App.jsx`
3. Update navigation in `Navbar.jsx`
4. Test thoroughly with the create event functionality

### Styling

- Uses Tailwind CSS with custom utilities
- Responsive design for mobile and desktop
- Dark theme with glassmorphism effects
- Custom scrollbars and animations

## Troubleshooting

### Common Issues

#### Missing Environment Variables
If you see errors about missing Pinata API credentials:

1. Create a `.env` file in the Client directory
2. Add your Pinata API keys:
   ```env
   VITE_PINATA_API_KEY=your_actual_api_key_here
   VITE_PINATA_API_SECRET=your_actual_secret_key_here
   ```
3. Restart your development server

#### IPFS Upload Failures
If images or metadata fail to upload to IPFS:

1. Check your Pinata API keys are correct
2. Verify your Pinata account has sufficient credits
3. Check the browser console for detailed error messages
4. Ensure your image files are under 10MB

#### Images Not Displaying
If event images are not showing up:

1. Check that the metadata was properly uploaded to IPFS
2. Verify the image URL in the metadata is correct
3. Check the browser console for network errors
4. Try accessing the IPFS gateway URL directly

#### MetaMask Not Opening
If MetaMask is not opening when you click the connect button:

1. Make sure MetaMask is installed and unlocked
2. Check if MetaMask is blocked by your browser
3. Try refreshing the page
4. Check the browser console for errors

### Debugging IPFS Issues

The application now includes enhanced logging for IPFS operations:

1. **Check Browser Console**: Look for detailed logs about IPFS uploads
2. **Verify API Keys**: Ensure your Pinata credentials are correct
3. **Test Gateway Access**: Try accessing uploaded content directly via Pinata gateway
4. **Check Network Tab**: Monitor network requests to Pinata API

### Getting Pinata API Keys

1. Go to [Pinata Cloud](https://app.pinata.cloud/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API Key and Secret API Key
6. Add them to your `.env` file

### Testing IPFS Functionality

To test if IPFS is working correctly:

1. Create a new event with an image
2. Check the browser console for upload logs
3. Verify the image appears in the event card
4. Check that metadata is properly displayed
5. Try accessing the IPFS URLs directly in a new tab

## License

This project is part of the FairPass ecosystem for decentralized event management.
