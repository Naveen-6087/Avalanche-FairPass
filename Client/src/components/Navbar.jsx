import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Connect } from './connect';
import { Ticket, LayoutDashboard, ScanLine, Plus, Home, Search, Shield } from 'lucide-react';

export default function Navbar() {
  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'}`;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Ticket className="h-5 w-5 text-blue-500" />
          <span className="font-semibold">FairPass</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navClass}><Home className="h-4 w-4 inline mr-1"/>Home</NavLink>
          <NavLink to="/events" className={navClass}><Search className="h-4 w-4 inline mr-1"/>Browse</NavLink>
          <NavLink to="/organizer" className={navClass}><LayoutDashboard className="h-4 w-4 inline mr-1"/>Organizer</NavLink>
          <NavLink to="/attendee" className={navClass}><LayoutDashboard className="h-4 w-4 inline mr-1"/>Attendee</NavLink>
          <NavLink to="/admin" className={navClass}><Shield className="h-4 w-4 inline mr-1"/>Admin</NavLink>
          <NavLink to="/scan" className={navClass}><ScanLine className="h-4 w-4 inline mr-1"/>Scan</NavLink>
          <NavLink to="/create" className={navClass}><Plus className="h-4 w-4 inline mr-1"/>Create</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Connect />
        </div>
      </div>
    </header>
  );
}
