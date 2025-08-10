import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { MARKETPLACE, MARKETPLACE_ABI, EVENT_CONTRACT, EVENT_CONTRACT_ABI } from '../lib/constants';

export default function Marketplace() {
  const [listing, setListing] = useState({ tokenId: '', price: '' });
  const { writeContractAsync, isPending } = useWriteContract();

  const onChange = (e) => setListing((l) => ({ ...l, [e.target.name]: e.target.value }));

  const listTicket = async (e) => {
    e.preventDefault();
    await writeContractAsync({ address: MARKETPLACE, abi: MARKETPLACE_ABI, functionName: 'listTicket', args: [BigInt(listing.tokenId), BigInt(listing.price)] });
    setListing({ tokenId: '', price: '' });
  };

  return (
    <section className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Marketplace</h2>
      <form className="space-y-3" onSubmit={listTicket}>
        <input className="w-full rounded-md bg-white/5 px-3 py-2" name="tokenId" placeholder="Token ID" value={listing.tokenId} onChange={onChange} required />
        <input className="w-full rounded-md bg-white/5 px-3 py-2" name="price" placeholder="Price (wei)" value={listing.price} onChange={onChange} required />
        <button disabled={isPending} className="rounded-md bg-white px-4 py-2 text-black disabled:opacity-50">{isPending ? 'Listing...' : 'List Ticket'}</button>
      </form>
      <p className="text-white/60 text-sm">Note: Marketplace requires the NFT approval pattern, but your ERC721 disables approvals. Listing will revert unless contract allows transfers via marketplace. Adjust flow as needed.</p>
    </section>
  );
}
