import axios from 'axios';

// Set these in your .env file
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

export async function pinFile(file) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.error('Missing Pinata API credentials. Please set VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your .env file');
    throw new Error('Missing VITE_PINATA_API_KEY or VITE_PINATA_API_SECRET');
  }
  
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const form = new FormData();
  form.append('file', file);
  
  try {
    console.log('Uploading file to IPFS via Pinata...', { fileName: file.name, fileSize: file.size });
    
    const res = await axios.post(url, form, {
      headers: { 
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET 
      },
    });
    
    console.log('File uploaded successfully to IPFS:', res.data);
    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error.response?.data || error.message);
    throw new Error(`Failed to upload image to IPFS: ${error.response?.data?.error || error.message}`);
  }
}

export async function pinJSON(json) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.error('Missing Pinata API credentials. Please set VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your .env file');
    throw new Error('Missing VITE_PINATA_API_KEY or VITE_PINATA_API_SECRET');
  }
  
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  try {
    console.log('Uploading metadata to IPFS via Pinata...', json);
    
    const res = await axios.post(url, json, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Metadata uploaded successfully to IPFS:', res.data);
    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error.response?.data || error.message);
    throw new Error(`Failed to upload metadata to IPFS: ${error.response?.data?.error || error.message}`);
  }
}

// Helper function to fetch and parse metadata from IPFS
export async function fetchMetadata(metadataURI) {
  try {
    if (!metadataURI) return null;
    
    // Convert ipfs:// URI to gateway URL
    const gatewayUrl = metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    console.log('Fetching metadata from:', gatewayUrl);
    
    const response = await axios.get(gatewayUrl);
    console.log('Metadata fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    return null;
  }
}


