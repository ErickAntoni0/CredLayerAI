// MicroPay MX - Configuración Simplificada
// Este archivo contiene configuraciones básicas para desarrollo

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

export const config = {
  // URLs de red
  networks: {
    arbitrum: {
      rpc: 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      name: 'Arbitrum One'
    },
    arbitrumTestnet: {
      rpc: 'https://goerli-rollup.arbitrum.io/rpc',
      chainId: 421613,
      name: 'Arbitrum Goerli'
    },
    scroll: {
      rpc: 'https://rpc.scroll.io',
      chainId: 534352,
      name: 'Scroll'
    },
    scrollTestnet: {
      rpc: 'https://sepolia-rpc.scroll.io',
      chainId: 534351,
      name: 'Scroll Sepolia'
    }
  },

  // Contratos (direcciones de ejemplo)
  contracts: {
    microPay: '0x1234567890123456789012345678901234567890',
    loanManager: '0x2345678901234567890123456789012345678901',
    reputationENS: '0x3456789012345678901234567890123456789012',
    culturaChain: '0x4567890123456789012345678901234567890123',
    // Nuevos contratos de demo (rellena tras deploy)
    mockUSDC: ENV.VITE_MOCK_USDC_ADDRESS || '',
    paymentEscrow: ENV.VITE_PAYMENT_ESCROW_ADDRESS || '',
    loansVault: ENV.VITE_LOANS_VAULT_ADDRESS || ''
  },

  // ENS
  ens: {
    registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    baseDomain: 'micro.eth'
  },

  // Tokens
  tokens: {
    usdc: {
      arbitrum: '0xA0b86a33E6441b8c4C8C0E1234567890abcdef12',
      scroll: '0x1234567890123456789012345678901234567890'
    },
    // mUSDC local de test
    musdc: {
      arbitrumTestnet: ENV.VITE_MOCK_USDC_ADDRESS || '',
      scrollTestnet: ENV.VITE_MOCK_USDC_ADDRESS_SCROLL || ''
    }
  },

  // Configuración de la aplicación
  app: {
    name: 'MicroPay MX Platform',
    version: '1.0.0',
    hackathon: 'Ethereum México 2025',
    prize: '$15,000 USD'
  },

  // Configuración de reputación
  reputation: {
    levels: [
      { min: 0, max: 199, level: 'Novato', color: 'red', multiplier: 0.8 },
      { min: 200, max: 399, level: 'Principiante', color: 'orange', multiplier: 1.0 },
      { min: 400, max: 599, level: 'Intermedio', color: 'yellow', multiplier: 1.1 },
      { min: 600, max: 799, level: 'Avanzado', color: 'blue', multiplier: 1.3 },
      { min: 800, max: 1000, level: 'Experto', color: 'green', multiplier: 1.5 }
    ]
  },

  // Configuración de préstamos
  loans: {
    minAmount: 10, // USDC
    maxAmount: 10000, // USDC
    minDuration: 15, // días
    maxDuration: 365, // días
    platformFee: 0.02, // 2%
    communityFee: 0.01 // 1%
  },

  // Configuración de CulturaChain
  culturaChain: {
    categories: [
      { id: 'musician', name: 'Músico', icon: '🎵' },
      { id: 'artist', name: 'Artista Visual', icon: '🎨' },
      { id: 'writer', name: 'Escritor', icon: '✍️' },
      { id: 'podcaster', name: 'Podcaster', icon: '🎙️' },
      { id: 'youtuber', name: 'YouTuber', icon: '📹' },
      { id: 'streamer', name: 'Streamer', icon: '🎮' },
      { id: 'photographer', name: 'Fotógrafo', icon: '📸' },
      { id: 'craftsman', name: 'Artesano', icon: '🔨' }
    ],
    platformFee: 0.02, // 2%
    emergencyFundPercentage: 0.05 // 5% del earnings
  }
};

export default config;
