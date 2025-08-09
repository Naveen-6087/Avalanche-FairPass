import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import CONTRACTS from '../constants/constants';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export default function EventDetails() {
  const { id } = useParams();
  const eventId = useMemo(() => BigInt(id), [id]);
  const [buyTokenId, setBuyTokenId] = useState('');

  // Read event contract address for this eventId
  const { data: eventContractAddr, isLoading: loadingEventAddr, error: addrError } = useReadContract({
    address: CONTRACTS.ADDRESSES.EVENT_MANAGER,
    abi: CONTRACTS.ABI.EVENT_MANAGER,
    functionName: 'getEventContract',
    args: [eventId],
  });

  // Read event details
  const { data: detailsRaw, isLoading: loadingDetails, error: detailsError } = useReadContract({
    address: CONTRACTS.ADDRESSES.EVENT_MANAGER,
    abi: CONTRACTS.ABI.EVENT_MANAGER,
    functionName: 'getEventDetails',
    args: [eventId],
  });

  const details = useMemo(() => {
    if (!detailsRaw) return null;
    const d = detailsRaw;
    return {
      name: d[0],
      symbol: d[1],
      uri: d[2],
      maxSupply: d[3]?.toString?.() ?? String(d[3]),
      priceWei: d[4],
      price: d[4] ? ethers.formatEther(d[4]) : '0',
      startTime: d[5] ? Number(d[5]) : 0,
      endTime: d[6] ? Number(d[6]) : 0,
      beneficiary: d[7],
    };
  }, [detailsRaw]);

  // Write: buy ticket on marketplace
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = async () => {
    if (!eventContractAddr) return toast.error('No event contract found');
    if (!buyTokenId) return toast.error('Enter a tokenId');
    try {
      toast.loading('Purchasing...', { id: 'buy' });
      writeContract({
        address: CONTRACTS.ADDRESSES.MARKETPLACE,
        abi: CONTRACTS.ABI.MARKETPLACE,
        functionName: 'buyTicket',
        args: [eventContractAddr, BigInt(buyTokenId)],
        value: details?.priceWei ?? 0n,
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Purchase failed', { id: 'buy' });
    }
  };

  if (addrError || detailsError) {
    console.error(addrError || detailsError);
    return <div className="text-red-400">Failed to load event.</div>;
  }

  const loading = loadingEventAddr || loadingDetails;
  if (loading) return <div>Loading event...</div>;

  

  if (loading) return <div>Loading event...</div>;

  return (
    <div className="space-y-4">
      <div className="h-48 w-full rounded-lg bg-zinc-800/60" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{details?.name || `Event #${id}`}</h1>
        <div className="text-sm text-zinc-400">Contract: <span className="font-mono">{String(eventContractAddr)}</span></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded border border-zinc-800 p-4 bg-zinc-900">
          <div className="text-zinc-400">Symbol</div>
          <div className="font-semibold">{details?.symbol}</div>
        </div>
        <div className="rounded border border-zinc-800 p-4 bg-zinc-900">
          <div className="text-zinc-400">Price</div>
          <div className="font-semibold">{details?.price} AVAX</div>
        </div>
        <div className="rounded border border-zinc-800 p-4 bg-zinc-900">
          <div className="text-zinc-400">Max Supply</div>
          <div className="font-semibold">{details?.maxSupply}</div>
        </div>
        <div className="rounded border border-zinc-800 p-4 bg-zinc-900">
          <div className="text-zinc-400">Beneficiary</div>
          <div className="font-mono text-sm">{details?.beneficiary}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 w-40" placeholder="Token ID" value={buyTokenId} onChange={(e)=>setBuyTokenId(e.target.value)} />
        <button disabled={isPending || waiting} onClick={buy} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
          {waiting ? 'Confirming...' : isPending ? 'Pending...' : 'Buy Ticket'}
        </button>
      </div>

      <div className="text-xs text-zinc-500">
        Marketplace: <span className="font-mono">{CONTRACTS.ADDRESSES.MARKETPLACE}</span>
      </div>
    </div>
  );
}
