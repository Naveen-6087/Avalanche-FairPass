import { Link, NavLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const linkBase = 'text-sm font-medium hover:text-white/90';
  const active = ({ isActive }) => (isActive ? `${linkBase} text-white` : `${linkBase} text-white/70`);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-black/40">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-white font-semibold">FairPass</Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/create" className={active}>Create Event</NavLink>
          <NavLink to="/events" className={active}>My Events</NavLink>
          <NavLink to="/marketplace" className={active}>Marketplace</NavLink>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </nav>
      </div>
    </header>
  );
}


