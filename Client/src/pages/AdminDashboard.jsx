import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800 p-4 bg-zinc-900">
          <h2 className="font-semibold mb-2">Manage Events</h2>
          <p className="text-sm text-zinc-400">View, verify, or remove suspicious events.</p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4 bg-zinc-900">
          <h2 className="font-semibold mb-2">Manage Users</h2>
          <p className="text-sm text-zinc-400">Search wallet addresses and manage roles.</p>
        </div>
      </div>
    </div>
  );
}
