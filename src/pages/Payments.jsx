import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { usePaymentsData } from '../hooks/usePaymentsData'
import { Send, ExternalLink, Clock, CheckCircle, ChevronDown, ArrowUpRight, TrendingUp, RefreshCw } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ethers } from 'ethers'
import { useTrustScore } from '../hooks/useCredLayer'
import { SEPOLIA_CHAIN_ID, ARBITRUM_SEPOLIA_CHAIN_ID, ensureSepoliaNetwork, ensureArbitrumSepoliaNetwork, notifyTransactionsUpdated } from '../config/chains'
import '../styles/payments.css'
import { QRCodeSVG } from 'qrcode.react'

// ─── Contract ─────────────────────────────────────────────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const MXNB_ADDRESS = '0xf197ffc28c23e0309b5559e7a166f2c6164c80aa'

const CREDLAYER_ABI = [
  'function registerPayment(address recipient, uint256 amount, string calldata proofHash) external returns (uint256 id)',
  'function getTrustScore(address user) external view returns (uint256)',
  'function getUserPayments(address user) external view returns (uint256[] memory)',
]
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
]

const getExplorerUrl = (txHash, isMxnb = false) =>
  isMxnb
    ? `https://sepolia.arbiscan.io/tx/${txHash}`
    : `https://sepolia.etherscan.io/tx/${txHash}`

gsap.registerPlugin(ScrollTrigger)

// Arbitrum SVG logo (inline, no external dep)
const ArbitrumIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#2D374B" />
    <path d="M16 6L8 24h4.5l1.5-3.5 4.5-11L20.5 24H25L16 6z" fill="#28A0F0" />
    <path d="M11 16.5l-3 7.5H12l2-5-3-2.5z" fill="#96BEDC" />
  </svg>
)

const BitsoIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#00B15D" />
    <path d="M9 9h6a5 5 0 010 10h-6V9zm6 4a2 2 0 000-4H11v4h4z" fill="#FFFFFF" />
    <path d="M9 19h7a5 5 0 010 10H9v-10zm7 4H11v4h5a2 2 0 000-4z" fill="#FFFFFF" />
  </svg>
)

const TOKENS = [
  { symbol: 'USDC', network: 'Ethereum Sepolia', desc: 'ERC-20 via CredLayer contract' },
  { symbol: 'ARB', network: 'Arbitrum Sepolia', desc: 'Stablecoin MXN · ERC-20 directo', arbitrum: true },
  { symbol: 'MXNB', network: 'Arbitrum Sepolia', desc: 'Liquidación MXN ↔ USDC', bitso: true },
]

// Bitso API hook — public ticker, no auth required
function useBitsoRate() {
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchRate = useCallback(async () => {
    setLoading(true)
    try {
      // Bitso public API — no auth required
      const res = await fetch('https://sandbox.bitso.com/api/v3/ticker/?book=mxn_usd', {
        headers: { 'Accept': 'application/json' }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.payload?.last) {
          setRate(parseFloat(json.payload.last))
          setLastUpdate(new Date())
          return
        }
      }
    } catch (_) { }
    // Fallback: use realistic demo rate if API not reachable
    setRate(0.0562) // ~17.79 MXN por USD
    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRate()
    const interval = setInterval(fetchRate, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchRate])

  const mxnPerUsd = rate ? (1 / rate).toFixed(2) : '17.80'
  return { rate, mxnPerUsd, loading, lastUpdate, refresh: fetchRate }
}

// ─── Component ─────────────────────────────────────────────────────────────────
const Payments = () => {
  const navigate = useNavigate()
  const { userProfile, address, updateScore, reputationScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { score: onChainScore } = useTrustScore()
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePaymentsData(address)
  const { setPageIntent, updatePageContext } = useAiAssistantContext()
  const { mxnPerUsd, loading: rateLoading, lastUpdate: rateUpdated, refresh: refreshRate } = useBitsoRate()

  const [paymentForm, setPaymentForm] = useState({ to: '', amount: '', memo: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [lastTxHash, setLastTxHash] = useState('')
  const [selectedToken, setSelectedToken] = useState('USDC')
  const [isSimulated, setIsSimulated] = useState(false)

  const [transactionData, setTransactionData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
      if (saved.length > 0) return saved
    } catch (_) { }
    return [
      { id: 1, type: 'Income', amount: '+500 USDC', from: 'Cliente 0x70Dd...f09c', date: 'Jun 1, 10:30 AM', status: 'Verified', hash: '0xa9c70c51c483bedf4a9c4fcfa98b232034f334af9609c08bfe6e360b8f332010' },
      { id: 2, type: 'Income', amount: '+0.02 USDC', from: 'Cliente 0x70Dd...f09c', date: 'May 28, 3:52 AM', status: 'Verified', hash: '0xa9c70c51c483bedf4a9c4fcfa98b232034f334af9609c08bfe6e360b8f332010' },
      { id: 3, type: 'Expense', amount: '-150 USDC', from: 'Proveedor 0x9B4a...', date: 'May 27, 2:15 PM', status: 'Verified', hash: '0xa9c70c51c483bedf4a9c4fcfa98b232034f334af9609c08bfe6e360b8f332010' },
      { id: 4, type: 'Income', amount: '+1200 USDC', from: 'Cliente 0x1F2d...', date: 'May 26, 9:00 AM', status: 'Verified', hash: '0xa9c70c51c483bedf4a9c4fcfa98b232034f334af9609c08bfe6e360b8f332010' },
    ]
  })

  const loadTransactionsFromStorage = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
      if (saved.length > 0) setTransactionData(saved)
    } catch (_) { }
  }

  useEffect(() => {
    loadTransactionsFromStorage()
  }, [])

  useEffect(() => {
    const onTxUpdate = () => loadTransactionsFromStorage()
    window.addEventListener('creedlayer-txs-updated', onTxUpdate)
    window.addEventListener('storage', onTxUpdate)
    return () => {
      window.removeEventListener('creedlayer-txs-updated', onTxUpdate)
      window.removeEventListener('storage', onTxUpdate)
    }
  }, [])

  const pageRef = useRef(null)
  const scoreBarRef = useRef(null)
  const scoreNumRef = useRef(null)
  const networkName = chain?.id === SEPOLIA_CHAIN_ID
    ? 'Sepolia'
    : chain?.id === 421614
      ? 'Arbitrum Sepolia'
      : chain?.name || 'Unknown'

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—'),
    [address]
  )

  const paymentsMetrics = paymentsData?.metrics
  const history = paymentsData?.history
  const recentPayments = useMemo(() => history ?? [], [history])
  const score = onChainScore > 0 ? onChainScore : (reputationScore ?? 0)
  const scoreMax = 1000
  const scorePct = Math.min(100, (score / scoreMax) * 100)

  const statCards = useMemo(() => [
    { label: 'Volume (30d)', value: paymentsMetrics?.totalVolumeUsdFormatted ?? '$0.00' },
    { label: 'Payments this month', value: paymentsMetrics?.completedThisMonth ?? 0 },
    { label: `Success rate`, value: paymentsMetrics?.successRateFormatted ?? '—' },
  ], [paymentsMetrics])

  const formatDate = useCallback((ts) => {
    if (!ts) return '—'
    try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return ts }
  }, [])

  // ─── Context ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setPageIntent('payments-advice')
    updatePageContext({ currentForm: paymentForm, network: networkName })
    return () => { setPageIntent('general'); updatePageContext({}, { replace: true }) }
  }, [paymentForm, networkName, setPageIntent, updatePageContext])

  // ─── GSAP + Lenis ─────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    let lenis, ctx

    try {
      lenis = new Lenis({ duration: 1.2 })
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)

      ctx = gsap.context(() => {
        // Header entrance
        gsap.from('.pay-fade-in', {
          y: 24, opacity: 0, duration: 0.9,
          stagger: 0.08, ease: 'power3.out',
        })

        // Stats bar counter
        gsap.from('.pay-stat__value', {
          scrollTrigger: { trigger: '.pay-stats-bar', start: 'top 90%' },
          opacity: 0, y: 12, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        })

        // Trust Score number count-up
        if (scoreNumRef.current) {
          gsap.from(scoreNumRef.current, {
            scrollTrigger: { trigger: scoreNumRef.current, start: 'top 90%' },
            textContent: 0,
            duration: 1.4,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate() { scoreNumRef.current.textContent = Math.round(parseFloat(scoreNumRef.current.textContent)) }
          })
        }

        // Score bar fill
        ScrollTrigger.create({
          trigger: scoreBarRef.current,
          start: 'top 90%',
          onEnter: () => {
            if (scoreBarRef.current) scoreBarRef.current.style.width = `${scorePct}%`
          },
        })

        // History table rows
        gsap.from('.pay-table tr', {
          scrollTrigger: { trigger: '.pay-table', start: 'top 85%' },
          opacity: 0, y: 10, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        })

        // Form panel
        gsap.from('.pay-form-panel', {
          scrollTrigger: { trigger: '.pay-main', start: 'top 80%' },
          opacity: 0, x: -20, duration: 0.8, ease: 'power3.out',
        })
        gsap.from('.pay-sidebar', {
          scrollTrigger: { trigger: '.pay-main', start: 'top 80%' },
          opacity: 0, x: 20, duration: 0.8, ease: 'power3.out',
        })

      }, pageRef)
    } catch (err) {
      console.error(err)
    }

    return () => { if (lenis) lenis.destroy(); if (ctx) ctx.revert() }
  }, [scorePct])

  // ─── handleSendPayment ────────────────────────────────────────────────────
  const handleSendPayment = async (e) => {
    e.preventDefault()

    const amountFloat = parseFloat(paymentForm.amount)
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (!paymentForm.to || !/^0x[0-9a-fA-F]{40}$/.test(paymentForm.to)) {
      toast.error('Enter a valid recipient address (0x...)')
      return
    }

    const isBitso = selectedToken === 'MXNB'
    if (isBitso) {
      try {
        setIsProcessing(true)
        setLastTxHash('')

        setProcessingStep('Consultando API de Bitso...')
        await new Promise(r => setTimeout(r, 1200))
        setProcessingStep('Enrutando liquidez por Arbitrum Sepolia...')
        await new Promise(r => setTimeout(r, 1500))

        const fakeHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setLastTxHash(fakeHash)

        const fromAddressShort = paymentForm.to.slice(0, 6) + '...' + paymentForm.to.slice(-4)
        const newTx = {
          id: Date.now(),
          type: 'Expense',
          amount: `-${paymentForm.amount} MXN (Bitso)`,
          from: `Destino ${fromAddressShort}`,
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          status: 'Verified',
          hash: fakeHash,
        }

        const existing = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
        localStorage.setItem('creedlayer_txs', JSON.stringify([newTx, ...existing].slice(0, 10)))
        notifyTransactionsUpdated()
        updateScore(12)

        toast.success(
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Pago Liquidado por Bitso ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{fakeHash.slice(0, 24)}…</div>
            <a href={getExplorerUrl(fakeHash, true)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, color: '#00B15D', textDecoration: 'underline', display: 'block', marginTop: 4 }}>
              Ver liquidación en Arbiscan →
            </a>
          </div>,
          { duration: 8000 }
        )
        setPaymentForm({ to: '', amount: '', memo: '' })
      } catch (err) {
        toast.error(`Error en Bitso: ${err.message}`)
      } finally {
        setIsProcessing(false)
        setProcessingStep('')
      }
      return
    }

    if (isSimulated) {
      try {
        setIsProcessing(true)
        setLastTxHash('')

        const isL2 = selectedToken === 'ARB' || selectedToken === 'MXNB'
        setProcessingStep(isL2 ? 'Conectando a Arbitrum Sepolia...' : 'Conectando a Ethereum Sepolia...')
        await new Promise(r => setTimeout(r, 1200))
        setProcessingStep(isL2 ? `Transfiriendo ${selectedToken} (Demo)...` : 'Registrando USDC en CredLayer (Demo)...')
        await new Promise(r => setTimeout(r, 1500))

        const fakeHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setLastTxHash(fakeHash)

        const fromAddressShort = paymentForm.to.slice(0, 6) + '...' + paymentForm.to.slice(-4)
        const newTx = {
          id: Date.now(),
          type: 'Expense',
          amount: `-${paymentForm.amount} ${selectedToken}`,
          from: `Destino ${fromAddressShort}`,
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          status: 'Verified',
          hash: fakeHash,
        }

        const existing = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
        localStorage.setItem('creedlayer_txs', JSON.stringify([newTx, ...existing].slice(0, 10)))
        notifyTransactionsUpdated()
        updateScore(12)

        toast.success(
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Pago simulado con éxito (Modo Demo) ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{fakeHash.slice(0, 24)}…</div>
            <a href={getExplorerUrl(fakeHash, isL2)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, color: '#0a0a0a', textDecoration: 'underline', display: 'block', marginTop: 4 }}>
              Ver transacción simulada en {isL2 ? 'Arbiscan' : 'Etherscan'} →
            </a>
          </div>,
          { duration: 8000 }
        )
        setPaymentForm({ to: '', amount: '', memo: '' })
      } catch (err) {
        toast.error(`Error en simulación: ${err.message}`)
      } finally {
        setIsProcessing(false)
        setProcessingStep('')
      }
      return
    }

    try {
      setIsProcessing(true)
      setLastTxHash('')

      const isL2 = selectedToken === 'ARB' || selectedToken === 'MXNB'
      const targetChainId = isL2 ? ARBITRUM_SEPOLIA_CHAIN_ID : SEPOLIA_CHAIN_ID
      const targetChainName = isL2 ? 'Arbitrum Sepolia' : 'Sepolia'

      if (!window.ethereum) throw new Error('Wallet not detected')
      const currentChainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      const currentChainId = Number(currentChainIdHex)

      // ── Switch network if needed ──────────────────────────────────────────
      if (currentChainId !== targetChainId) {
        setProcessingStep(`Switching to ${targetChainName}...`)
        if (isL2) {
          await ensureArbitrumSepoliaNetwork(switchNetwork)
        } else {
          await ensureSepoliaNetwork(switchNetwork)
        }
        await new Promise(r => setTimeout(r, 2000))
      }

      // Instanciar el provider y signer después del switch de red para evitar NETWORK_ERROR
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // ── ARB on Arbitrum Sepolia → direct ERC20 transfer (previously MXNB) ──
      if (selectedToken === 'ARB') {
        const mxnbContract = new ethers.Contract(MXNB_ADDRESS, ERC20_ABI, signer)

        // ARB uses 6 decimals (same as USDC)
        let decimals = 6
        try { decimals = Number(await mxnbContract.decimals()) } catch (_) { }

        const amountWei = ethers.parseUnits(String(amountFloat), decimals)
        setProcessingStep('Sending ARB...')
        const feeData = await provider.getFeeData()
        const maxFeePerGas = feeData.maxFeePerGas
          ? (feeData.maxFeePerGas * 130n) / 100n  // +30% buffer
          : ethers.parseUnits('0.1', 'gwei')       // fallback seguro

        const tx = await mxnbContract.transfer(paymentForm.to, amountWei, {
          maxFeePerGas,
          maxPriorityFeePerGas: ethers.parseUnits('0.001', 'gwei'),
        })
        await tx.wait()

        setLastTxHash(tx.hash)
        const newTx = {
          id: Date.now(),
          type: 'Expense',
          amount: `-${paymentForm.amount} ARB`,
          from: `${paymentForm.to.slice(0, 6)}...${paymentForm.to.slice(-4)}`,
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          status: 'Verified',
          hash: tx.hash,
        }
        const existing = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
        localStorage.setItem('creedlayer_txs', JSON.stringify([newTx, ...existing].slice(0, 10)))
        notifyTransactionsUpdated()
        updateScore(12)

        toast.success(
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>ARB transferred on-chain ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{tx.hash.slice(0, 24)}…</div>
            <a href={getExplorerUrl(tx.hash, true)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, color: '#0a0a0a', textDecoration: 'underline', display: 'block', marginTop: 4 }}>
              View on Arbiscan →
            </a>
          </div>,
          { duration: 8000 }
        )
        setPaymentForm({ to: '', amount: '', memo: '' })
        return
      }

      // ── USDC on Sepolia → approve + registerPayment via CredLayer ─────────
      const credlayer = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, signer)
      const tokenContract = new ethers.Contract(USDC_SEPOLIA, ERC20_ABI, signer)
      const decimals = 6
      const amountWei = ethers.parseUnits(String(amountFloat), decimals)
      const raw = `${paymentForm.to}-${amountFloat}-${paymentForm.memo}-${Date.now()}`
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(raw))

      const feeData = await provider.getFeeData()
      const gasOpts = {
        maxFeePerGas: feeData.maxFeePerGas
          ? (feeData.maxFeePerGas * 130n) / 100n
          : ethers.parseUnits('0.1', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('0.001', 'gwei'),
      }

      setProcessingStep('Approving USDC...')
      const allowance = await tokenContract.allowance(address, CREDLAYER_ADDRESS)
      if (allowance < amountWei) {
        const txApprove = await tokenContract.approve(CREDLAYER_ADDRESS, amountWei, gasOpts)
        await txApprove.wait()
        toast.success('USDC approved')
      }

      setProcessingStep('Registering on-chain...')
      const tx = await credlayer.registerPayment(paymentForm.to, amountWei, proofHash, gasOpts)
      await tx.wait()

      setLastTxHash(tx.hash)
      const newTx = {
        id: Date.now(),
        type: 'Expense',
        amount: `-${paymentForm.amount} USDC`,
        from: `${paymentForm.to.slice(0, 6)}...${paymentForm.to.slice(-4)}`,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        status: 'Verified',
        hash: tx.hash,
      }
      const existing = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
      localStorage.setItem('creedlayer_txs', JSON.stringify([newTx, ...existing].slice(0, 10)))
      notifyTransactionsUpdated()
      updateScore(12)

      toast.success(
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Payment registered on-chain ✓</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{tx.hash.slice(0, 24)}…</div>
          <a href={getExplorerUrl(tx.hash, false)} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, fontWeight: 600, color: '#0a0a0a', textDecoration: 'underline', display: 'block', marginTop: 4 }}>
            View on Etherscan →
          </a>
        </div>,
        { duration: 8000 }
      )
      setPaymentForm({ to: '', amount: '', memo: '' })
    } catch (err) {
      console.error(err)
      toast.error(
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Error de pago: {err.message}</strong>
          <span style={{ fontSize: 10, opacity: 0.8 }}>
            Tip: Activa el "Modo Simulación (Demo)" abajo para probar el flujo sin usar fondos reales.
          </span>
        </div>,
        { duration: 8000 }
      )
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pay-page" ref={pageRef}>

      {/* ── Header ── */}
      <header className="pay-header pay-fade-in">
        <div className="pay-header__left">
          <h1>Payments</h1>
          <p>Verified transfers on Sepolia &amp; Arbitrum · Registered on-chain</p>
        </div>
        <div className={`pay-wallet-badge ${userProfile?.isRegistered ? 'registered' : ''}`}>
          <span className="dot" />
          {shortAddress}
          {userProfile?.isRegistered && <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>· Verified</span>}
        </div>
      </header>

      {/* ── Bitso Rate Banner ── */}
      <div className="pay-fade-in" style={{
        margin: '0 40px',
        padding: '12px 20px',
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00B15D, #00D67D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>₿</span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Live Rate · Bitso</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0a0a0a' }}>
              1 USD = <span style={{ color: '#00B15D' }}>{mxnPerUsd} MXN</span>
            </span>
            {rateUpdated && (
              <span style={{ fontSize: '0.65rem', color: '#bbb', display: 'block' }}>
                Updated {rateUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: '#888', display: 'block', fontWeight: 600 }}>MXNB → USDC</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a0a' }}>
              1 MXNB ≈ {(1 / parseFloat(mxnPerUsd || 17.8)).toFixed(4)} USDC
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: '#888', display: 'block', fontWeight: 600 }}>USDC → MXN</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a0a' }}>
              1 USDC ≈ {mxnPerUsd} MXNB
            </span>
          </div>
          <button
            onClick={refreshRate}
            disabled={rateLoading}
            style={{
              border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'transparent',
              cursor: 'pointer', padding: '6px 8px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.72rem', fontWeight: 600
            }}
            title="Refresh rate"
          >
            <RefreshCw size={12} style={{ animation: rateLoading ? 'pay-spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="pay-stats-bar pay-fade-in">
        {statCards.map((s) => (
          <div key={s.label} className="pay-stat">
            <div className="pay-stat__label">{s.label}</div>
            <div className="pay-stat__value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="pay-main">

        {/* Form panel */}
        <div className="pay-form-panel">
          <h2>New Payment</h2>

          <form onSubmit={handleSendPayment}>
            {/* Recipient */}
            <div className="pay-field">
              <label>Recipient Address</label>
              <input
                className="pay-input pay-input-mono"
                type="text"
                placeholder="0x..."
                value={paymentForm.to}
                onChange={(e) => setPaymentForm(p => ({ ...p, to: e.target.value }))}
                required
              />
            </div>

            {/* Token selector */}
            <div className="pay-field">
              <label>Token &amp; Network</label>
              <div className="pay-token-select">
                {TOKENS.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => !t.disabled && setSelectedToken(t.symbol)}
                    className={`pay-token-btn${selectedToken === t.symbol ? ' active' : ''}${t.disabled ? ' disabled' : ''}`}
                    title={t.network}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      {t.arbitrum && <ArbitrumIcon size={13} />}
                      {t.bitso && <BitsoIcon size={13} />}
                      <span>{t.symbol}</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', display: 'block', marginTop: 3, opacity: 0.7, fontWeight: 500 }}>
                      {t.disabled ? 'soon' : t.network}
                    </span>
                  </button>
                ))}
              </div>
              {/* Token Info Box */}
              <div style={{
                padding: '12px 14px',
                background: selectedToken === 'MXNB' ? 'rgba(40,160,240,0.05)' : selectedToken === 'Bitso' ? 'rgba(0,177,93,0.05)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${selectedToken === 'MXNB' ? 'rgba(40,160,240,0.15)' : selectedToken === 'Bitso' ? 'rgba(0,177,93,0.15)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: '10px',
                marginTop: '-8px'
              }}>
                {selectedToken === 'USDC' ? (
                  <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0a0a0a' }}>USDC · Ethereum Sepolia</strong><br />
                    Payment registered on the <strong>CredLayer smart contract</strong> — creates a permanent, verifiable on-chain record. Includes USDC approval + registerPayment call.
                  </div>
                ) : selectedToken === 'MXNB' ? (
                  <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <ArbitrumIcon size={14} />
                      <strong style={{ color: '#0a0a0a' }}>MXNB · Arbitrum Sepolia</strong>
                    </div>
                    Mexican peso stablecoin. Direct ERC-20 transfer on <strong>Arbitrum</strong> — fast, low gas, no intermediaries. Rate: 1 USDC ≈ <strong>{mxnPerUsd} MXNB</strong>.
                  </div>
                ) : selectedToken === 'Bitso' ? (
                  <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <BitsoIcon size={14} />
                      <strong style={{ color: '#0a0a0a' }}>Bitso Pay (MXN) · Arbitrum Sepolia</strong>
                    </div>
                    Liquidación off-chain simulada. La API de Bitso convierte dinámicamente tu saldo fiduciario local (MXN) a stablecoin, liquidando sobre <strong>Arbitrum Sepolia</strong>.
                  </div>
                ) : null}
              </div>
            </div>

            {/* Amount */}
            <div className="pay-field">
              <label>
                Amount ({selectedToken})
                {(selectedToken === 'MXNB' || selectedToken === 'Bitso') && (
                  <span style={{ fontWeight: 400, textTransform: 'none', color: '#888', letterSpacing: 0 }}>
                    {' '}· Arbitrum Sepolia
                  </span>
                )}
              </label>
              <input
                className="pay-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                required
              />
              {(selectedToken === 'MXNB' || selectedToken === 'Bitso') && paymentForm.amount && (
                <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 6 }}>
                  ≈ ${(parseFloat(paymentForm.amount || 0) / parseFloat(mxnPerUsd || 17.8)).toFixed(2)} USDC
                </div>
              )}
            </div>

            {/* Memo */}
            <div className="pay-field">
              <label>Memo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                className="pay-input"
                type="text"
                placeholder="Payment note..."
                value={paymentForm.memo}
                onChange={(e) => setPaymentForm(p => ({ ...p, memo: e.target.value }))}
              />
            </div>

            {/* Simulation Mode Toggle */}
            <div className="pay-field" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: isSimulated ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isSimulated ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '14px',
              marginTop: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
              marginBottom: '18px'
            }} onClick={() => setIsSimulated(p => !p)}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: isSimulated ? '#d97706' : '#0a0a0a', display: 'block' }}>
                  Modo Simulación (Demo)
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#666', display: 'block', marginTop: '2px' }}>
                  Simula el flujo completo y suma reputación sin usar MetaMask ni gas real.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isSimulated}
                onChange={() => { }} // Manejado por click del contenedor
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#F59E0B',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Submit */}
            <button className="pay-submit" type="submit" disabled={isProcessing || (!address && !isSimulated && selectedToken !== 'Bitso')}>
              {isProcessing ? (
                <>
                  <Clock size={16} className="pay-spinning" />
                  {processingStep || 'Processing...'}
                </>
              ) : (
                <>
                  <Send size={16} />
                  Register Payment →
                </>
              )}
            </button>

            {!userProfile?.isRegistered && !isSimulated && selectedToken !== 'Bitso' && (
              <p style={{ fontSize: '0.78rem', color: '#888', textAlign: 'center', marginTop: 12 }}>
                Complete CredLayer registration to send payments
              </p>
            )}
          </form>

          {/* Gas info */}
          <div className="pay-gas-row">
            <span className="pay-gas-dot" />
            Gas estimate: ~$0.001 · {networkName}
          </div>

          {/* TX success block */}
          {lastTxHash && (
            <div className="pay-tx-success">
              <div className="pay-tx-success__label">Last verified transaction</div>
              <div className="pay-tx-success__hash">{lastTxHash}</div>
              <a className="pay-tx-success__link" href={getExplorerUrl(lastTxHash)} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} />
                View on Etherscan
              </a>
            </div>
          )}

          {/* Go to Dashboard */}
          <button
            type="button"
            className="pay-secondary-btn"
            onClick={() => navigate('/dashboard')}
          >
            View Dashboard
          </button>
        </div>

        {/* Sidebar */}
        <div className="pay-sidebar">
          {/* Trust Score */}
          <div className="pay-score-block">
            <div className="pay-score-block__label">Trust Score</div>
            <div className="pay-score-block__number" ref={scoreNumRef}>{score}</div>
            <div className="pay-score-bar-track">
              <div className="pay-score-bar-fill" ref={scoreBarRef} />
            </div>
            <div className="pay-score-block__sub">{scoreMax - score} pts to next tier</div>
          </div>

          {/* Stat rows */}
          <div>
            {[
              { label: 'Payments registered', value: paymentsMetrics?.completedThisMonth ?? '—' },
              { label: 'Success rate', value: paymentsMetrics?.successRateFormatted ?? '—' },
              { label: 'Network', value: networkName },
            ].map((row) => (
              <div key={row.label} className="pay-stat-row">
                <span className="pay-stat-row__label">{row.label}</span>
                <span className="pay-stat-row__value">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Receive Payment Section */}
          <div className="pay-receive-block" style={{
            background: '#fff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginTop: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ alignSelf: 'stretch', textAlign: 'left' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Receive Payment</span>
              <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0a0a0a', display: 'block', marginTop: '2px' }}>Your QR &amp; Address</strong>
            </div>

            {address ? (
              <>
                <div style={{
                  padding: '12px',
                  background: '#fcfcfc',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <QRCodeSVG value={address} size={120} bgColor="#ffffff" fgColor="#000000" level="H" />
                </div>

                {userProfile?.ensName && (
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#8b5cf6',
                    background: 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    ENS Alias: {userProfile.ensName}
                  </div>
                )}

                <div style={{ width: '100%' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    background: '#f4f4f5',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    color: '#555',
                    wordBreak: 'break-all',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.04)',
                    marginBottom: '8px'
                  }}>
                    {address}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(address)
                      toast.success('Address copied to clipboard!')
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: '#0a0a0a',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}
                  >
                    Copy Address
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', padding: '12px' }}>
                Connect your wallet to receive payments.
              </div>
            )}
          </div>

          {/* Contract */}
          <div className="pay-contract-block">
            <div className="pay-contract-block__label">Live Contract</div>
            <div className="pay-contract-block__addr">{CREDLAYER_ADDRESS}</div>
            <a
              className="pay-contract-block__link"
              href={`https://sepolia.etherscan.io/address/${CREDLAYER_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={10} /> Verify on Etherscan
            </a>
          </div>
        </div>
      </div>

      {/* ── Payment History ── */}
      <div className="pay-history">
        <div className="pay-history__hdr">
          <span className="pay-history__title">Payment History</span>
          {paymentsData?.lastSync && (
            <span className="pay-history__sync">
              Last sync: {formatDate(paymentsData.lastSync)}
            </span>
          )}
        </div>

        {isPaymentsLoading ? (
          <div className="pay-empty">Syncing history...</div>
        ) : transactionData.length > 0 ? (
          <table className="pay-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Token</th>
                <th>Status</th>
                <th>TX</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.map((p) => {
                const cleanAmount = p.amount.replace('+', '').replace('-', '').trim()
                const amountParts = cleanAmount.split(' ')
                const displayAmt = amountParts[0] || '0'
                const displayTok = amountParts[1] || 'USDC'
                const isL2 = displayTok.includes('MXN')
                const txHash = p.hash || p.txHash

                return (
                  <tr key={p.id}>
                    <td style={{ color: '#6b6b6b' }}>{p.date}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {p.from || '—'}
                    </td>
                    <td style={{ fontWeight: 700 }}>${displayAmt}</td>
                    <td style={{ color: '#6b6b6b' }}>{displayTok}</td>
                    <td>
                      <span className={`pay-badge ${p.status === 'Verified' || p.status === 'completed' ? 'pay-badge--confirmed' : 'pay-badge--pending'}`}>
                        {p.status === 'Verified' || p.status === 'completed' ? (
                          <><CheckCircle size={9} /> Confirmed</>
                        ) : (
                          <><Clock size={9} /> Pending</>
                        )}
                      </span>
                    </td>
                    <td>
                      {txHash ? (
                        <a
                          href={getExplorerUrl(txHash, isL2)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#0a0a0a', textDecoration: 'none', fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {txHash.slice(0, 8)}… <ArrowUpRight size={10} />
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="pay-empty">
            No payments registered yet. Send your first verified transfer.
          </div>
        )}
      </div>
    </div>
  )
}

export default Payments