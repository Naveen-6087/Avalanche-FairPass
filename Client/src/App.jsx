import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import EventDetails from './pages/EventDetails'
import AttendeeDashboard from './pages/AttendeeDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CreateEvent from './pages/CreateEvent'
import ScanTicket from './pages/ScanTicket'
import ContractDemo from './components/ContractDemo'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Toaster position="top-right" />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Browse />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/attendee" element={<AttendeeDashboard />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/scan" element={<ScanTicket />} />
          {/* Temporary: keep Contract demo page for testing */}
          <Route path="/demo" element={<ContractDemo />} />
        </Routes>
      </main>
    </div>
  )
}

export default App