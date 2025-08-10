import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import {WagmiConfig} from "./Wagmi";
import {RainbowKitProvider,} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {avalancheFuji} from 'wagmi/chains';
import {QueryClientProvider,QueryClient,} from "@tanstack/react-query";
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

// Debug logging
console.log('Main.jsx: Initializing FairPass DApp');
console.log('Main.jsx: WagmiConfig:', WagmiConfig);
console.log('Main.jsx: Target chain:', avalancheFuji);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={WagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          initialChain={avalancheFuji} 
          coolMode={true}
          onConnect={(connectInfo) => {
            console.log('RainbowKit: Wallet connected:', connectInfo);
          }}
          onDisconnect={() => {
            console.log('RainbowKit: Wallet disconnected');
          }}
        >
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);