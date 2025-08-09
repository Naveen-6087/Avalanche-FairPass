import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function ScanTicket() {
  const [nft, setNft] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      setStatus('');
      if (!window.ethereum) throw new Error('Wallet not available');
      if (!nft || !tokenId) throw new Error('Enter contract and tokenId');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const abi = [
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function balanceOf(address owner) view returns (uint256)'
      ];
      const contract = new ethers.Contract(nft, abi, provider);
      const owner = await contract.ownerOf(tokenId);
      setStatus(`Valid • Owner: ${owner}`);
    } catch (err) {
      console.error(err);
      setStatus(`Invalid • ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan / Verify Ticket</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
        <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 md:col-span-2" placeholder="NFT Contract Address" value={nft} onChange={(e)=>setNft(e.target.value)} />
        <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" placeholder="Token ID" value={tokenId} onChange={(e)=>setTokenId(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button onClick={verify} disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50">{loading ? 'Verifying…' : 'Verify'}</button>
        {status && <div className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm">{status}</div>}
      </div>
      <p className="text-xs text-zinc-500">For production, integrate camera QR scanning to fill the contract and tokenId automatically.</p>
    </div>
  );
}
