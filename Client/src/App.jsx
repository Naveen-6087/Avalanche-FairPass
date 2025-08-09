import './App.css'
import { useAccount } from 'wagmi'
import {Connect} from './components/connect'



function App() {
  const { address } = useAccount();

  return (
    <div className="container">
      <p className="font-mono text-blue-600">Wallet: {address}</p>
      <div className="card"><Connect /></div>
    </div>
  )
}

export default App