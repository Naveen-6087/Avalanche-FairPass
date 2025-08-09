import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Discover, Create, and Manage NFT Ticketed Events</h1>
        <p className="text-zinc-400">Powered by Avalanche Fuji and FairPass smart contracts.</p>
        <div className="flex items-center justify-center gap-3">
          <Link className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500" to="/events">Browse Events</Link>
          <Link className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700" to="/create">Create Event</Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal list-inside text-zinc-300 space-y-1">
          <li>Connect your wallet</li>
          <li>Organizers create events and mint NFT tickets</li>
          <li>Attendees buy and use tickets with on-chain verification</li>
        </ol>
      </section>
    </div>
  );
}
