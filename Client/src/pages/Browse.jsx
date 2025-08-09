import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Browse() {
  const [query, setQuery] = useState('');
  // Placeholder events. Replace with on-chain or DB indexing later.
  const events = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 w-72"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800">
          <option>All Categories</option>
          <option>Music</option>
          <option>Tech</option>
          <option>Sports</option>
        </select>
        <select className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800">
          <option>Sort: Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length === 0 && (
          <div className="col-span-full text-zinc-400">No events yet. Organizers can create one from the Create page.</div>
        )}
        {events.map((ev) => (
          <Link key={ev.id} to={`/events/${ev.id}`} className="rounded-lg border border-zinc-800 p-4 bg-zinc-900 hover:bg-zinc-800">
            <div className="h-32 w-full rounded bg-zinc-800/60 mb-3" />
            <div className="font-semibold">{ev.title}</div>
            <div className="text-sm text-zinc-400">{ev.date}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
