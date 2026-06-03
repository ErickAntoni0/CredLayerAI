// useCredLayer.js - Versión final compatible con Wagmi v1 y Viem
// Contrato: 0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount
} from 'wagmi'
import { parseUnits, keccak256, stringToBytes } from 'viem'
import { SEPOLIA_CHAIN_ID } from '../config/chains'

// ============================================================
// CONFIGURACIÓN DEL CONTRATO
// ============================================================

export const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

export const CREDLAYER_ABI = [
  {
    name: 'registerPayment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'proofHash', type: 'string' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    name: 'getTrustScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserPayments',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  }
]

export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  }
]

// ============================================================
// HOOKS V1
// ============================================================

// Public Sepolia RPC – used as fallback when wallet is on a different chain
const SEPOLIA_RPC = 'https://rpc.ankr.com/eth_sepolia'

export function useTrustScore() {
  const { address } = useAccount()
  const [fallbackScore, setFallbackScore] = useState(0)

  const { data, isLoading, refetch } = useContractRead({
    address: CREDLAYER_ADDRESS,
    abi: CREDLAYER_ABI,
    functionName: 'getTrustScore',
    args: [address],
    chainId: SEPOLIA_CHAIN_ID,
    enabled: !!address,
  })

  // When Wagmi returns 0 (e.g. wallet is on a different chain), fall back to
  // a direct ethers.js call on the public Sepolia RPC.
  useEffect(() => {
    if (!address) return
    if (data && Number(data) > 0) return // Wagmi already has a value

    let cancelled = false
    ;(async () => {
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC)
        const contract = new ethers.Contract(
          CREDLAYER_ADDRESS,
          ['function getTrustScore(address user) external view returns (uint256)'],
          provider
        )
        const score = await contract.getTrustScore(address)
        if (!cancelled) setFallbackScore(Number(score))
      } catch (_) {
        // silently ignore – trust score stays at 0
      }
    })()

    return () => { cancelled = true }
  }, [address, data])

  const score = data && Number(data) > 0 ? Number(data) : fallbackScore

  return {
    score,
    isLoading,
    refetch,
  }
}


export function useUserPayments() {
  const { address } = useAccount()
  const { data, isLoading, refetch } = useContractRead({
    address: CREDLAYER_ADDRESS,
    abi: CREDLAYER_ABI,
    functionName: 'getUserPayments',
    args: [address],
    chainId: SEPOLIA_CHAIN_ID,
    enabled: !!address,
  })

  return {
    paymentIds: data ? data.map(Number) : [],
    isLoading,
    refetch,
  }
}

export function useRegisterPayment(recipient, amountUSDC) {
  const amountWei = parseUnits(String(amountUSDC || 0), 6)
  const proofHash = keccak256(stringToBytes(`${recipient}-${amountUSDC}-${Date.now()}`))

  // 1. Prepare Approve
  const { config: approveConfig } = usePrepareContractWrite({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'approve',
    args: [CREDLAYER_ADDRESS, amountWei],
    enabled: !!recipient && amountWei > 0,
  })
  const approve = useContractWrite(approveConfig)

  // 2. Prepare Register
  const { config: registerConfig } = usePrepareContractWrite({
    address: CREDLAYER_ADDRESS,
    abi: CREDLAYER_ABI,
    functionName: 'registerPayment',
    args: [recipient, amountWei, proofHash],
    enabled: !!recipient && amountWei > 0,
  })
  const register = useContractWrite(registerConfig)

  return {
    approve,
    register,
    isPending: approve.isLoading || register.isLoading
  }
}

export const getExplorerUrl = (txHash) => `https://sepolia.etherscan.io/tx/${txHash}`
export const getAddressUrl = (address) => `https://sepolia.etherscan.io/address/${address}`
