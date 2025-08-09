import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrganizerDashboard() {
  const [events] = useState([]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
        <Link to="/create" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500">Create Event</Link>
      </div>
      {events.length === 0 ? (
        <div className="text-zinc-400">No events yet. Create your first event.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((e) => (
            <div key={e.id} className="rounded-lg border border-zinc-800 p-4 bg-zinc-900">
              <div className="font-semibold">{e.title}</div>
              <div className="text-sm text-zinc-400">Sold: {e.sold} • Revenue: {e.revenue}</div>
              <div className="mt-2 flex gap-2">
                <Link className="px-3 py-1 rounded bg-zinc-800" to={`/events/${e.id}`}>View</Link>
                <button className="px-3 py-1 rounded bg-zinc-800">Edit</button>
                <button className="px-3 py-1 rounded bg-zinc-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
