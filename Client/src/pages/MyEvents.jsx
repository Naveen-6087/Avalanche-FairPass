import { useReadContract } from 'wagmi';
import { EVENT_MANAGER, EVENT_MANAGER_ABI } from '../lib/constants';
import { useState } from 'react';

export default function MyEvents() {
  const [eventId, setEventId] = useState('0');
  const { data, refetch, isFetching } = useReadContract({
    address: EVENT_MANAGER,
    abi: EVENT_MANAGER_ABI,
    functionName: 'getEventDetails',
    args: [BigInt(eventId || '0')],
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">My Events</h2>
      <div className="flex items-center gap-3">
        <input className="rounded-md bg-white/5 px-3 py-2" value={eventId} onChange={(e)=>setEventId(e.target.value)} placeholder="Event ID" />
        <button onClick={() => refetch()} className="rounded-md bg-white px-3 py-2 text-black" disabled={isFetching}>Fetch</button>
      </div>
      {data && (
        <div className="rounded-lg border border-white/10 p-4">
          <div className="font-medium">{data.name}</div>
          <div className="text-white/70">{data.location} — {data.date}</div>
          <div className="text-white/70">Price (wei): {String(data.ticketPrice)}</div>
          <div className="text-white/70">Organizer: {data.organizer}</div>
        </div>
      )}
    </section>
  );
}
