export const SEPOLIA_CHAIN_ID = 11155111
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614

export const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com'
export const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc'

export async function waitForChainId(targetChainId, maxMs = 15000) {
  if (!window.ethereum) throw new Error('Wallet not detected')
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    const hex = await window.ethereum.request({ method: 'eth_chainId' })
    if (parseInt(hex, 16) === targetChainId) return
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error('Network switch timed out — confirm the switch in MetaMask')
}

export async function getWalletChainId() {
  if (!window.ethereum) return null
  const hex = await window.ethereum.request({ method: 'eth_chainId' })
  return parseInt(hex, 16)
}

export async function switchWalletToSepolia() {
  if (!window.ethereum) throw new Error('Wallet not detected')
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    })
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia',
          nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: [SEPOLIA_RPC],
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      })
    } else {
      throw err
    }
  }
}

export async function switchWalletToArbitrumSepolia() {
  if (!window.ethereum) throw new Error('Wallet not detected')
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x66eee' }],
    })
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x66eee',
          chainName: 'Arbitrum Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: [ARBITRUM_SEPOLIA_RPC],
          blockExplorerUrls: ['https://sepolia.arbiscan.io'],
        }],
      })
    } else {
      throw err
    }
  }
}

/** Switch to Ethereum Sepolia — wagmi switchNetwork first, wallet fallback */
export async function ensureSepoliaNetwork(switchNetwork) {
  const current = await getWalletChainId()
  if (current === SEPOLIA_CHAIN_ID) return

  if (switchNetwork) {
    try {
      await switchNetwork(SEPOLIA_CHAIN_ID)
      await waitForChainId(SEPOLIA_CHAIN_ID)
      return
    } catch (_) {
      /* fallback below */
    }
  }
  await switchWalletToSepolia()
  await waitForChainId(SEPOLIA_CHAIN_ID)
}

/** Switch to Arbitrum Sepolia — wagmi switchNetwork first, wallet fallback */
export async function ensureArbitrumSepoliaNetwork(switchNetwork) {
  const current = await getWalletChainId()
  if (current === ARBITRUM_SEPOLIA_CHAIN_ID) return

  if (switchNetwork) {
    try {
      await switchNetwork(ARBITRUM_SEPOLIA_CHAIN_ID)
      await waitForChainId(ARBITRUM_SEPOLIA_CHAIN_ID)
      return
    } catch (_) {
      /* fallback below */
    }
  }
  await switchWalletToArbitrumSepolia()
  await waitForChainId(ARBITRUM_SEPOLIA_CHAIN_ID)
}

export function notifyTransactionsUpdated() {
  window.dispatchEvent(new CustomEvent('creedlayer-txs-updated'))
}
