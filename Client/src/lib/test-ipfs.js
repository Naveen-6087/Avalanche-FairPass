// Test script to verify IPFS functionality
// Run this in the browser console to test your Pinata setup

import { pinFile, pinJSON, fetchMetadata } from './pinata.js';

export async function testIPFSFunctionality() {
  console.log('🧪 Testing IPFS functionality...');
  
  // Test 1: Check environment variables
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
  const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
  
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.error('❌ Missing Pinata API credentials. Please set VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your .env file');
    return false;
  }
  
  console.log('✅ Environment variables are set');
  
  // Test 2: Create a test JSON object
  const testMetadata = {
    name: "Test Event",
    description: "This is a test event for IPFS functionality",
    image: "ipfs://test-image-hash",
    attributes: [
      { trait_type: 'Location', value: 'Test Location' },
      { trait_type: 'Date', value: '2024-12-25' },
      { trait_type: 'Event Type', value: 'Test' },
      { trait_type: 'Price (Wei)', value: '1000000000000000000' },
    ],
  };
  
  try {
    console.log('📤 Uploading test metadata to IPFS...');
    const metadataURI = await pinJSON(testMetadata);
    console.log('✅ Metadata uploaded successfully:', metadataURI);
    
    // Test 3: Fetch the metadata back
    console.log('📥 Fetching metadata from IPFS...');
    const fetchedMetadata = await fetchMetadata(metadataURI);
    console.log('✅ Metadata fetched successfully:', fetchedMetadata);
    
    // Test 4: Verify the data matches
    if (fetchedMetadata.name === testMetadata.name) {
      console.log('✅ Metadata verification successful');
    } else {
      console.error('❌ Metadata verification failed');
      return false;
    }
    
    console.log('🎉 All IPFS tests passed! Your setup is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ IPFS test failed:', error);
    return false;
  }
}

// Function to test file upload (requires a file input)
export async function testFileUpload(file) {
  if (!file) {
    console.error('❌ No file provided for testing');
    return false;
  }
  
  console.log('📤 Testing file upload to IPFS...', { fileName: file.name, fileSize: file.size });
  
  try {
    const fileURI = await pinFile(file);
    console.log('✅ File uploaded successfully:', fileURI);
    return fileURI;
  } catch (error) {
    console.error('❌ File upload failed:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testIPFSFunctionality = testIPFSFunctionality;
  window.testFileUpload = testFileUpload;
}
