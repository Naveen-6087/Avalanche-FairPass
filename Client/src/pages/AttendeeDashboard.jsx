import React from 'react';

export default function AttendeeDashboard() {
  // Placeholder ticket data
  const tickets = [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="text-zinc-400">No tickets yet. Browse events to purchase.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => (
            <div key={t.tokenId} className="rounded-lg border border-zinc-800 p-4 bg-zinc-900">
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-zinc-400">Token #{t.tokenId}</div>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 rounded bg-zinc-800">Show QR</button>
                <a className="px-3 py-1 rounded bg-zinc-800" href={t.metadata} target="_blank" rel="noreferrer">Metadata</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
