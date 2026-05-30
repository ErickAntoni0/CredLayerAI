import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
import { useNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { usePaymentsData } from '../hooks/usePaymentsData'
import { Send, ExternalLink, Clock, CheckCircle, ChevronDown, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ethers } from 'ethers'

// ─── Contract ─────────────────────────────────────────────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const USDC_SEPOLIA      = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

const CREDLAYER_ABI = [
  'function registerPayment(address recipient, uint256 amount, string calldata proofHash) external returns (uint256 id)',
  'function getTrustScore(address user) external view returns (uint256)',
  'function getUserPayments(address user) external view returns (uint256[] memory)',
]
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
]

const getExplorerUrl = (txHash) => `https://sepolia.etherscan.io/tx/${txHash}`

gsap.registerPlugin(ScrollTrigger)

// ─── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .pay-page * { 
    box-sizing: border-box; 
    font-family: 'Inter', sans-serif; 
    transition: background-color 0.2s cubic-bezier(0.23, 1, 0.32, 1), 
                border-color 0.2s cubic-bezier(0.23, 1, 0.32, 1), 
                box-shadow 0.2s cubic-bezier(0.23, 1, 0.32, 1), 
                transform 0.15s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .pay-page { 
    background: #f8f9fa; 
    color: #0a0a0a; 
    min-height: 100vh; 
    padding-bottom: 40px;
  }

  /* Header */
  .pay-header {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .pay-header__left h1 {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 4px;
    line-height: 1.1;
  }
  .pay-header__left p {
    font-size: 0.85rem;
    color: #6b6b6b;
    margin: 0;
  }
  .pay-wallet-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 100px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #3d3d3d;
    background: #fff;
  }
  .pay-wallet-badge:active {
    transform: scale(0.96);
  }
  .pay-wallet-badge .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #0a0a0a;
    flex-shrink: 0;
  }
  .pay-wallet-badge.registered .dot { background: #16a34a; }

  /* Stats bar */
  .pay-stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 32px 40px 12px;
  }
  .pay-stat {
    padding: 24px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 18px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01);
  }
  .pay-stat__label { 
    font-size: 0.72rem; 
    color: #888; 
    font-weight: 600; 
    margin-bottom: 8px; 
    text-transform: uppercase; 
    letter-spacing: 0.04em;
  }
  .pay-stat__value { 
    font-size: 1.6rem; 
    font-weight: 800; 
    letter-spacing: -0.04em; 
  }

  /* Main grid */
  .pay-main {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    padding: 20px 40px 32px;
  }

  /* Form panel */
  .pay-form-panel {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
    padding: 36px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
  }
  .pay-form-panel h2 {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 28px;
  }
  .pay-field { margin-bottom: 22px; }
  .pay-field label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: #3d3d3d;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .pay-input {
    width: 100%;
    padding: 13px 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    font-size: 0.88rem;
    color: #0a0a0a;
    background: #fff;
    outline: none;
    font-family: 'Inter', sans-serif;
  }
  .pay-input:focus { 
    border-color: #0a0a0a; 
    box-shadow: 0 0 0 4px rgba(10, 10, 10, 0.05);
  }
  .pay-input::placeholder { color: #b0b0b0; }
  .pay-input-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 0.8rem; }

  /* Token selector */
  .pay-token-select {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .pay-token-btn {
    flex: 1;
    padding: 11px 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    color: #6b6b6b;
    text-align: center;
  }
  .pay-token-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }
  .pay-token-btn.active { background: #0a0a0a; border-color: #0a0a0a; color: #fff; }
  .pay-token-btn.disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
  .pay-token-btn:active:not(.disabled) {
    transform: scale(0.96);
  }

  /* Submit button */
  .pay-submit {
    width: 100%;
    padding: 15px 20px;
    background: #0a0a0a;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    letter-spacing: -0.01em;
  }
  .pay-submit:hover:not(:disabled) { background: #222; }
  .pay-submit:active:not(:disabled) { transform: scale(0.97); }
  .pay-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Secondary button */
  .pay-secondary-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px 20px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    color: #3d3d3d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .pay-secondary-btn:hover {
    border-color: #0a0a0a;
    color: #0a0a0a;
    background: rgba(0, 0, 0, 0.02);
  }
  .pay-secondary-btn:active {
    transform: scale(0.97);
  }

  /* Gas info */
  .pay-gas-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
    font-size: 0.72rem;
    color: #888;
  }
  .pay-gas-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }

  /* TX success */
  .pay-tx-success {
    margin-top: 24px;
    padding: 18px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    background: #fafafa;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
  }
  .pay-tx-success__label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3d3d3d; margin-bottom: 6px; }
  .pay-tx-success__hash { font-family: monospace; font-size: 0.72rem; color: #666; word-break: break-all; margin-bottom: 8px; }
  .pay-tx-success__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #0a0a0a;
    text-decoration: none;
  }
  .pay-tx-success__link:hover { text-decoration: underline; }

  /* Sidebar panel */
  .pay-sidebar {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
    padding: 36px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
    height: fit-content;
  }

  /* Trust Score */
  .pay-score-block { margin-bottom: 36px; }
  .pay-score-block__label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin-bottom: 8px;
  }
  .pay-score-block__number {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .pay-score-bar-track {
    height: 5px;
    background: #e8e8e8;
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .pay-score-bar-fill {
    height: 100%;
    background: #0a0a0a;
    border-radius: 100px;
    width: 0%;
  }
  .pay-score-block__sub { font-size: 0.72rem; color: #888; }

  /* Stat rows */
  .pay-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.8rem;
  }
  .pay-stat-row:last-child { border-bottom: none; }
  .pay-stat-row__label { color: #6b6b6b; }
  .pay-stat-row__value { font-weight: 700; }

  /* Contract block */
  .pay-contract-block {
    margin-top: 28px;
    padding: 16px;
    background: #0a0a0a;
    border-radius: 16px;
  }
  .pay-contract-block__label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 6px; }
  .pay-contract-block__addr { font-family: monospace; font-size: 0.68rem; color: #a0a0a0; word-break: break-all; margin-bottom: 10px; }
  .pay-contract-block__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.68rem;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    opacity: 0.7;
  }
  .pay-contract-block__link:hover { opacity: 1; }

  /* History section */
  .pay-history { 
    margin: 0 40px 40px; 
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
    padding: 36px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
  }
  .pay-history__hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pay-history__title { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; }
  .pay-history__sync { font-size: 0.72rem; color: #999; }

  /* Table */
  .pay-table { width: 100%; border-collapse: collapse; }
  .pay-table th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #888;
    padding: 0 12px 12px;
    border-bottom: 1px solid #e8e8e8;
  }
  .pay-table td {
    padding: 16px 12px;
    font-size: 0.82rem;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }
  .pay-table tr:last-child td { border-bottom: none; }
  .pay-table tr:hover td { background: #fafafa; }

  .pay-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid;
  }
  .pay-badge--confirmed { border-color: rgba(0, 0, 0, 0.12); color: #0a0a0a; background: transparent; }
  .pay-badge--pending   { border-color: rgba(0, 0, 0, 0.06); color: #999; background: transparent; }

  .pay-empty {
    padding: 64px 40px;
    text-align: center;
    color: #b0b0b0;
    font-size: 0.88rem;
  }

  /* Spinning loader */
  @keyframes pay-spin { to { transform: rotate(360deg); } }
  .pay-spinning { animation: pay-spin 0.8s linear infinite; }

  @media (max-width: 768px) {
    .pay-stats-bar { grid-template-columns: 1fr; gap: 12px; padding: 20px 20px 0; }
    .pay-stat { padding: 18px; }
    .pay-main { grid-template-columns: 1fr; gap: 20px; padding: 16px 20px; }
    .pay-form-panel { padding: 24px; }
    .pay-sidebar { padding: 24px; }
    .pay-header { padding: 20px; }
    .pay-history { margin: 0 20px 20px; padding: 24px; }
    .pay-table th, .pay-table td { padding: 12px 6px; }
  }
`

const TOKENS = [
  { symbol: 'USDC', network: 'Ethereum Sepolia' },
  { symbol: 'MXNB', network: 'Arbitrum Sepolia' },
  { symbol: 'ETH',  network: 'Coming soon',      disabled: true },
]

// ─── Component ─────────────────────────────────────────────────────────────────
const Payments = () => {
  const navigate = useNavigate()
  const { userProfile, address, reputationScore, updateScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePaymentsData(address)
  const { setPageIntent, updatePageContext } = useAiAssistantContext()

  const [paymentForm, setPaymentForm]   = useState({ to: '', amount: '', memo: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [lastTxHash, setLastTxHash]     = useState('')
  const [selectedToken, setSelectedToken] = useState('USDC')

  const pageRef      = useRef(null)
  const scoreBarRef  = useRef(null)
  const scoreNumRef  = useRef(null)
  const networkName  = chain?.name || 'Sepolia'

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—'),
    [address]
  )

  const paymentsMetrics = paymentsData?.metrics
  const history         = paymentsData?.history
  const recentPayments  = useMemo(() => history ?? [], [history])
  const score           = reputationScore ?? 0
  const scoreMax        = 1000
  const scorePct        = Math.min(100, (score / scoreMax) * 100)

  const statCards = useMemo(() => [
    { label: 'Volume (30d)',            value: paymentsMetrics?.totalVolumeUsdFormatted ?? '$0.00' },
    { label: 'Payments this month',     value: paymentsMetrics?.completedThisMonth ?? 0 },
    { label: `Success rate`,            value: paymentsMetrics?.successRateFormatted ?? '—' },
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

  // ─── Contracts ────────────────────────────────────────────────────────────
  const getContracts = useCallback(async () => {
    if (!window?.ethereum) throw new Error('Wallet not detected')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer   = await provider.getSigner()
    const credlayer = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, signer)
    const usdc      = new ethers.Contract(USDC_SEPOLIA,      ERC20_ABI,     signer)
    return { signer, credlayer, usdc }
  }, [])

  // ─── handleSendPayment ────────────────────────────────────────────────────
  const handleSendPayment = async (e) => {
    e.preventDefault()
    if (!userProfile?.isRegistered) {
      toast.error('Register in CredLayer AI first')
      return
    }
    const amountFloat = parseFloat(paymentForm.amount)
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      setIsProcessing(true)
      setLastTxHash('')
      const { credlayer, usdc } = await getContracts()
      const decimals  = selectedToken === 'ETH' ? 18 : 6
      const amountWei = ethers.parseUnits(String(amountFloat), decimals)
      const raw       = `${paymentForm.to}-${amountFloat}-${paymentForm.memo}-${Date.now()}`
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(raw))

      setProcessingStep('Approving USDC...')
      const allowance = await usdc.allowance(address, CREDLAYER_ADDRESS)
      if (allowance < amountWei) {
        const txApprove = await usdc.approve(CREDLAYER_ADDRESS, amountWei)
        await txApprove.wait()
        toast.success('USDC approved')
      }

      setProcessingStep('Registering on-chain...')
      const tx = await credlayer.registerPayment(paymentForm.to, amountWei, proofHash)
      await tx.wait()

      setLastTxHash(tx.hash)
      const newTx = {
        id: Date.now(), type: 'Income',
        amount: `+${paymentForm.amount} ${selectedToken}`,
        from: `${paymentForm.to.slice(0, 6)}...${paymentForm.to.slice(-4)}`,
        date: new Date().toLocaleString('en-US', { dateStyle: 'short' }),
        status: 'Verified', hash: tx.hash,
      }
      const existing = JSON.parse(localStorage.getItem('creedlayer_txs') || '[]')
      localStorage.setItem('creedlayer_txs', JSON.stringify([newTx, ...existing].slice(0, 10)))
      updateScore(12)

      toast.success(
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Payment verified on-chain ✓</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{tx.hash.slice(0, 24)}…</div>
          <a href={getExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, fontWeight: 600, color: '#0a0a0a', textDecoration: 'underline', display: 'block', marginTop: 4 }}>
            View on Etherscan →
          </a>
        </div>,
        { duration: 8000 }
      )
      setPaymentForm({ to: '', amount: '', memo: '' })
    } catch (err) {
      toast.error(`Payment error: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pay-page" ref={pageRef}>
      <style>{css}</style>

      {/* ── Header ── */}
      <header className="pay-header pay-fade-in">
        <div className="pay-header__left">
          <h1>Payments</h1>
          <p>Register verified transfers on Sepolia blockchain</p>
        </div>
        <div className={`pay-wallet-badge ${userProfile?.isRegistered ? 'registered' : ''}`}>
          <span className="dot" />
          {shortAddress}
          {userProfile?.isRegistered && <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>· Verified</span>}
        </div>
      </header>

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
              <label>Token</label>
              <div className="pay-token-select">
                {TOKENS.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => !t.disabled && setSelectedToken(t.symbol)}
                    className={`pay-token-btn${selectedToken === t.symbol ? ' active' : ''}${t.disabled ? ' disabled' : ''}`}
                    title={t.network}
                  >
                    {t.symbol}
                    {t.disabled && <span style={{ fontSize: '0.6rem', display: 'block', marginTop: 2, opacity: 0.7 }}>soon</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="pay-field">
              <label>
                Amount ({selectedToken})
                {selectedToken === 'MXNB' && (
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
              {selectedToken === 'MXNB' && paymentForm.amount && (
                <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 6 }}>
                  ≈ ${(parseFloat(paymentForm.amount || 0) / 17.5).toFixed(2)} USDC
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

            {/* Submit */}
            <button className="pay-submit" type="submit" disabled={isProcessing || !userProfile?.isRegistered}>
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

            {!userProfile?.isRegistered && (
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
              { label: 'Success rate',         value: paymentsMetrics?.successRateFormatted ?? '—' },
              { label: 'Network',              value: networkName },
            ].map((row) => (
              <div key={row.label} className="pay-stat-row">
                <span className="pay-stat-row__label">{row.label}</span>
                <span className="pay-stat-row__value">{row.value}</span>
              </div>
            ))}
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
        ) : recentPayments.length > 0 ? (
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
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: '#6b6b6b' }}>{formatDate(p.timestamp || p.date)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {p.to ? `${p.to.slice(0, 8)}...${p.to.slice(-4)}` : '—'}
                  </td>
                  <td style={{ fontWeight: 700 }}>${p.amount}</td>
                  <td style={{ color: '#6b6b6b' }}>USDC</td>
                  <td>
                    <span className={`pay-badge ${p.status === 'completed' ? 'pay-badge--confirmed' : 'pay-badge--pending'}`}>
                      {p.status === 'completed' ? (
                        <><CheckCircle size={9} /> Confirmed</>
                      ) : (
                        <><Clock size={9} /> Pending</>
                      )}
                    </span>
                  </td>
                  <td>
                    {p.txHash ? (
                      <a
                        href={getExplorerUrl(p.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#0a0a0a', textDecoration: 'none', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {p.txHash.slice(0, 8)}… <ArrowUpRight size={10} />
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
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