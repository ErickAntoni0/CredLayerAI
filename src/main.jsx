import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, arbitrum, arbitrumGoerli, sepolia } from 'wagmi/chains'
import { arbitrumSepolia } from 'viem/chains'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import React from 'react'
import ReactDOM from 'react-dom/client'
// Polyfills para compatibilidad de ethers v5 en navegador
import { Buffer } from 'buffer'
import process from 'process'

if (typeof window !== 'undefined') {
  // No-op si ya están definidos
  window.Buffer = window.Buffer || Buffer
  window.process = window.process || process
}

import App from './App'
import './index.css'
import './styles/membership-theme.css'
import { SEPOLIA_RPC, ARBITRUM_SEPOLIA_RPC } from './config/chains'

const RPC_SEPOLIA =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SEPOLIA_RPC_URL) ||
  SEPOLIA_RPC
const RPC_ARB_SEPOLIA =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ARB_SEPOLIA_RPC_URL) ||
  ARBITRUM_SEPOLIA_RPC

const { chains, publicClient } = configureChains(
  [sepolia, arbitrumSepolia, arbitrum, arbitrumGoerli, mainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === sepolia.id) return { http: RPC_SEPOLIA }
        if (chain.id === arbitrumSepolia.id) return { http: RPC_ARB_SEPOLIA }
        return null
      }
    }),
    publicProvider()
  ]
)

const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
})

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Render principal
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
)
