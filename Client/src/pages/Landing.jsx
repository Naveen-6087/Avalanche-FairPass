import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Users, Globe, Shield, Zap, Star, Calendar, MapPin, DollarSign, Bug } from 'lucide-react';
import { useUserConnection, useCurrentChain } from '@/lib/connections';

export default function Landing() {
  const { address, isConnected, isConnecting, isDisconnected } = useUserConnection();
  const { chainId, isAvalancheFuji } = useCurrentChain();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30px_30px,rgba(255,255,255,0.1)_2px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Revolutionizing Event Management with NFTs</span>
            </div>
          </div>
          
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FairPass
            </span>
            <br />
            <span className="text-4xl md:text-5xl">NFT Ticketing Platform</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-xl text-white/80 leading-relaxed">
            Create, manage, and trade event tickets as NFTs on the Avalanche blockchain. 
            Secure, transparent, and decentralized event management for the future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/create" 
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Create Your First Event
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center gap-3 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 hover:border-white/30 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Debug Section - Remove in production */}
      <section className="py-8 bg-gray-900 border-b border-gray-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Debug Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-yellow-300 mb-2"><strong>Wallet Status:</strong></p>
                <ul className="text-yellow-200 space-y-1">
                  <li>Connected: {isConnected ? 'Yes' : 'No'}</li>
                  <li>Connecting: {isConnecting ? 'Yes' : 'No'}</li>
                  <li>Disconnected: {isDisconnected ? 'Yes' : 'No'}</li>
                  {address && <li>Address: {address.slice(0, 6)}...{address.slice(-4)}</li>}
                </ul>
              </div>
              <div>
                <p className="text-yellow-300 mb-2"><strong>Network Status:</strong></p>
                <ul className="text-yellow-200 space-y-1">
                  <li>Chain ID: {chainId || 'Unknown'}</li>
                  <li>Avalanche Fuji: {isAvalancheFuji ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 text-xs text-yellow-300">
              <p>If MetaMask is not opening, check the browser console for errors.</p>
              <p>Make sure MetaMask extension is installed and unlocked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose FairPass?</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Built on Avalanche for speed, security, and scalability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">NFT Ticketing</h3>
              <p className="text-white/70">
                Each ticket is a unique NFT with verifiable ownership and transfer history
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">IPFS Storage</h3>
              <p className="text-white/70">
                Event images and metadata stored on decentralized IPFS for permanent access
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secondary Market</h3>
              <p className="text-white/70">
                Trade tickets on our marketplace with built-in royalty system for organizers
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Validation</h3>
              <p className="text-white/70">
                QR code-based ticket validation with automatic NFT burning after use
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fast & Cheap</h3>
              <p className="text-white/70">
                Built on Avalanche for sub-second finality and minimal transaction costs
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Royalty System</h3>
              <p className="text-white/70">
                Automatic royalty distribution to event organizers on ticket resales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Simple steps to create and manage your events
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Event</h3>
              <p className="text-white/70 mb-4">
                Set event details, upload images to IPFS, and configure ticket pricing
              </p>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Calendar className="w-4 h-4" />
                <MapPin className="w-4 h-4" />
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Mint Tickets</h3>
              <p className="text-white/70 mb-4">
                Generate unique NFT tickets with metadata stored on IPFS
              </p>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Ticket className="w-4 h-4" />
                <Users className="w-4 h-4" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Validate & Trade</h3>
              <p className="text-white/70 mb-4">
                Validate attendance with QR codes and trade tickets on marketplace
              </p>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Shield className="w-4 h-4" />
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the future of event management with blockchain technology. 
            Create your first event in minutes and start selling NFT tickets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/create" 
              className="inline-flex items-center gap-3 rounded-xl bg-white text-blue-600 px-8 py-4 text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


