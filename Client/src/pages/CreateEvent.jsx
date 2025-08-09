import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getContractBy } from '../lib/ethers';
import { ethers } from 'ethers';

export default function CreateEvent() {
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    uri: '',
    maxSupply: '',
    price: '', // AVAX
    startTime: '', // ISO input
    endTime: '', // ISO input
    beneficiary: '',
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!form.name || !form.symbol || !form.uri || !form.maxSupply || !form.price || !form.startTime || !form.endTime || !form.beneficiary) {
        toast.error('Please fill all fields');
        return;
      }
      const contract = await getContractBy('EVENT_MANAGER');
      const maxSupply = BigInt(form.maxSupply);
      const priceWei = ethers.parseEther(form.price);
      const startTs = BigInt(Math.floor(new Date(form.startTime).getTime() / 1000));
      const endTs = BigInt(Math.floor(new Date(form.endTime).getTime() / 1000));
      const tx = await contract.createEvent(
        form.name,
        form.symbol,
        form.uri,
        maxSupply,
        priceWei,
        startTs,
        endTs,
        form.beneficiary
      );
      toast.loading('Creating event...', { id: 'create' });
      const receipt = await tx.wait();
      toast.success('Event created!', { id: 'create' });
      console.log('CreateEvent receipt:', receipt);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Create event failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Event</h1>
      <form onSubmit={submit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="name" placeholder="Name" value={form.name} onChange={onChange} />
          <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="symbol" placeholder="Symbol" value={form.symbol} onChange={onChange} />
          <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 md:col-span-2" name="uri" placeholder="Base Token URI (ipfs://...)" value={form.uri} onChange={onChange} />
          <input type="number" min="1" className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="maxSupply" placeholder="Max Supply" value={form.maxSupply} onChange={onChange} />
          <input type="number" min="0" step="0.0001" className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="price" placeholder="Price (AVAX)" value={form.price} onChange={onChange} />
          <input type="datetime-local" className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="startTime" value={form.startTime} onChange={onChange} />
          <input type="datetime-local" className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800" name="endTime" value={form.endTime} onChange={onChange} />
          <input className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 md:col-span-2" name="beneficiary" placeholder="Beneficiary address" value={form.beneficiary} onChange={onChange} />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
