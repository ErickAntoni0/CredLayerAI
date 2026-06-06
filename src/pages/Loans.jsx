// src/pages/Loans.jsx
// CredLayer AI — Módulo de Microcréditos y Reputación Web3 con NFTs Dinámicos

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSwitchNetwork } from 'wagmi'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { useLoansData } from '../hooks/useLoansData'
import {
  CreditCard,
  Users,
  Wallet,
  Sparkles,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Check,
  Award,
  Coins,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  LayoutDashboard,
  Shield,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import latamImg from '../assets/latam1.jpg'
import handsImg from '../assets/imageHands.webp'
import { ARBITRUM_SEPOLIA_RPC, ensureArbitrumSepoliaNetwork } from '../config/chains'
import { useNavigate } from 'react-router-dom';
import LoanSparkline from '../components/LoanSparkline'
import '../styles/loans.css'

const MXNB_ADDRESS = '0xf197ffc28c23e0309b5559e7a166f2c6164c80aa'
const MXNB_REPAY_POOL = '0x000000000000000000000000000000000000dEaD'

gsap.registerPlugin(ScrollTrigger)

// Arbitrum SVG logo (inline, no external dep)
const ArbitrumIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#2D374B"/>
    <path d="M16 6L8 24h4.5l1.5-3.5 4.5-11L20.5 24H25L16 6z" fill="#28A0F0"/>
    <path d="M11 16.5l-3 7.5H12l2-5-3-2.5z" fill="#96BEDC"/>
  </svg>
)

const SPONSORS = [
  { name: 'alicia.eth', amount: '250 USDC', tier: 'Gold Sponsor', date: 'Just now' },
  { name: '0x8f2c...31a', amount: '1,200 USDC', tier: 'Community Ally', date: '5m ago' },
  { name: 'ramon.lens', amount: '350 MXNB', tier: 'Microfinance Ally', date: '12m ago' },
  { name: '0x3d9a...f4b', amount: '800 USDC', tier: 'Gold Sponsor', date: '30m ago' },
  { name: 'carlos.stylus', amount: '150 USDC', tier: 'Silver Sponsor', date: '1h ago' },
  { name: '0xa4b1...e99', amount: '2,500 USDC', tier: 'Lead Sponsor', date: '2h ago' },
]

const Loans = () => {
  const { address, reputationScore } = useWalletConnection()
  const { switchNetwork } = useSwitchNetwork()
  const { data: initialLoansData, isLoading: isLoadingLoans } = useLoansData(address)
  const tickerRef = useRef(null)

  // Balance MXNB
  const [mxnbBalance, setMxnbBalance] = useState('0.00')

  // Bitso Simulator States
  const [bitsoRate, setBitsoRate] = useState(17.8)
  const [bitsoLoading, setBitsoLoading] = useState(true)
  const [simAmount, setSimAmount] = useState('100')
  const [simDirection, setSimDirection] = useState('MXN_TO_USDC') // MXN_TO_USDC or USDC_TO_MXN

  useEffect(() => {
    const fetchBitsoRate = async () => {
      try {
        const res = await fetch('https://api.bitso.com/v3/ticker/?book=usd_mxn', {
          headers: { 'Accept': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.payload?.last) {
            setBitsoRate(parseFloat(json.payload.last))
          }
        }
      } catch (_) {
        // Fallback
      } finally {
        setBitsoLoading(false)
      }
    }
    fetchBitsoRate()
    const interval = setInterval(fetchBitsoRate, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!address) {
      setMxnbBalance('0.00')
      return
    }
    const fetchMxnb = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
        const abi = ["function balanceOf(address owner) view returns (uint256)"]
        const contract = new ethers.Contract('0xf197ffc28c23e0309b5559e7a166f2c6164c80aa', abi, provider)
        const bal = await contract.balanceOf(address)
        setMxnbBalance(ethers.formatUnits(bal, 6))
      } catch (e) {
        console.error("Error reading MXNB balance:", e)
        // Fallback realista en caso de error
        setMxnbBalance('12450.00')
      }
    }
    fetchMxnb()
    const interval = setInterval(fetchMxnb, 10000)
    return () => clearInterval(interval)
  }, [address])

  // Estados locales para simular interactividad en tiempo real durante la demo
  const [activeTab, setActiveTab] = useState('lend')
  const [availableLoans, setAvailableLoans] = useState([])
  const [myLoans, setMyLoans] = useState([])
  const [metrics, setMetrics] = useState({
    activePrincipal: 12500,
    activePrincipalFormatted: '$12,500 USDC',
    averageRate: '4.3% APR',
    fundedLoans: 28,
    supporters: 18
  })

  // Sincronizar estado inicial con el hook
  useEffect(() => {
    if (initialLoansData) {
      setAvailableLoans(initialLoansData.availableLoans || [])
      setMyLoans(initialLoansData.myLoans || [])
      if (initialLoansData.metrics) {
        setMetrics(initialLoansData.metrics)
      }
    }
  }, [initialLoansData])

  // Formulario para solicitar crédito
  const [amount, setAmount] = useState('500')
  const [duration, setDuration] = useState('30')
  const [interest, setInterest] = useState('4.2')
  const [purpose, setPurpose] = useState('Brought tools to do my job')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 3D Card Hover Effect State
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })

  // Modal de NFT de fondeador (Lend NFT Certificate)
  const [showFunderModal, setShowFunderModal] = useState(false)
  const [mintedFunderNft, setMintedFunderNft] = useState(null)
  const [isFunding, setIsFunding] = useState(null)

  // Manejo de efecto 3D en la tarjeta de crédito NFT
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    // Posición del mouse relativa a la tarjeta
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convertir a porcentajes y mapear a ángulos de rotación
    const percentX = x / rect.width
    const percentY = y / rect.height

    const degX = (percentY - 0.5) * -25 // inclinación vertical
    const degY = (percentX - 0.5) * 25  // inclinación horizontal

    setRotateX(degX)
    setRotateY(degY)
    setGlarePosition({ x: percentX * 100, y: percentY * 100 })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  // useLayoutEffect for GSAP animations
  React.useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Initial page stagger entrances
      gsap.from('.loans-title, .loans-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      })

      gsap.from('.loan-stat-card', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.2
      })

      gsap.from('.backers-ticker-section, .loans-tabs', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.4
      })

      // 2. Continuous horizontal sponsors ticker loop
      const ticker = tickerRef.current
      if (ticker) {
        const w = ticker.scrollWidth / 2
        const anim = gsap.to(ticker, {
          x: -w,
          ease: 'none',
          duration: 35,
          repeat: -1
        })

        const handleMouseEnter = () => anim.pause()
        const handleMouseLeave = () => anim.play()

        ticker.addEventListener('mouseenter', handleMouseEnter)
        ticker.addEventListener('mouseleave', handleMouseLeave)

        // Return cleanup inside context
        return () => {
          ticker.removeEventListener('mouseenter', handleMouseEnter)
          ticker.removeEventListener('mouseleave', handleMouseLeave)
          anim.kill()
        }
      }
    })

    return () => ctx.revert()
  }, [])

  // 3. Tab-based fade-in staggers
  React.useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      if (activeTab === 'lend') {
        gsap.from('.market-loan-card', {
          y: 20,
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          stagger: 0.05,
          ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
        })
      } else if (activeTab === 'borrow') {
        gsap.from('.borrow-form-card', {
          x: -20,
          opacity: 0,
          scale: 0.98,
          duration: 0.7,
          ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
        })
        gsap.from('.nft-preview-wrapper', {
          x: 20,
          opacity: 0,
          scale: 0.98,
          duration: 0.7,
          ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
        })
      } else if (activeTab === 'my') {
        gsap.from('.my-loan-card', {
          y: 20,
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          stagger: 0.05,
          ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
        })
      }
    })
    return () => ctx.revert()
  }, [activeTab])

  // Enviar formulario (Simular creación de NFT de crédito)
  const handleCreateLoan = async (e) => {
    e.preventDefault()
    if (!address) {
      toast.error('Please connect your wallet before continuing.')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Calculating Trust Score impact and pre-minting Credit NFT...')

    setTimeout(() => {
      toast.dismiss(toastId)
      toast.success('Credit NFT published successfully!')

      const newLoanId = `loan-user-${Date.now()}`

      // Agregar a la lista de "Mis préstamos" del usuario en estado pending
      const newLoan = {
        id: newLoanId,
        amount: parseFloat(amount).toFixed(2),
        currency: 'USDC',
        durationDays: parseInt(duration),
        purpose: purpose,
        status: 'active',
        statusLabel: 'Funding',
        remainingDays: parseInt(duration),
        nextPayment: `${(parseFloat(amount) * (1 + parseFloat(interest) / 100)).toFixed(2)} USDC`,
        nextPaymentDate: new Date(Date.now() + 86400000 * parseInt(duration)).toISOString(),
        reputationImpact: `+${Math.round(parseFloat(amount) * 0.05)} pts`
      }

      setMyLoans(prev => [newLoan, ...prev])

      // Actualizar métricas del dashboard
      setMetrics(prev => ({
        ...prev,
        fundedLoans: prev.fundedLoans + 1,
        activePrincipal: prev.activePrincipal + parseFloat(amount),
        activePrincipalFormatted: `$${(prev.activePrincipal + parseFloat(amount)).toLocaleString()} USDC`
      }))

      setIsSubmitting(false)
      setActiveTab('my') // Ir a mis préstamos para ver su tarjeta NFT
    }, 2000)
  }

  // Fonder Préstamo (Lend)
  const handleLend = (loan) => {
    if (!address) {
      toast.error('Connect your wallet to fund this loan.')
      return
    }

    setIsFunding(loan.id)
    const toastId = toast.loading(`Approving USDC to fund ${loan.borrower}'s request...`)

    setTimeout(() => {
      toast.dismiss(toastId)
      toast.success('USDC transfered successfully. Minting Funder Certificate...')

      // Simular minteo de NFT
      setTimeout(() => {
        setIsFunding(null)
        setMintedFunderNft({
          id: `backer-cert-${Date.now()}`,
          borrower: loan.borrower,
          amount: loan.amount,
          interest: loan.interestRate,
          backer: address.slice(0, 6) + '...' + address.slice(-4),
          badgeType: loan.riskLevel === 'Low' ? 'Community Silver' : 'Gold Protector'
        })
        setShowFunderModal(true)

        // Quitar de disponibles o marcar como 100%
        setAvailableLoans(prev => prev.map(item => {
          if (item.id === loan.id) {
            return { ...item, funded: 100, supporters: item.supporters + 1 }
          }
          return item
        }))

        setMetrics(prev => ({
          ...prev,
          supporters: prev.supporters + 1
        }))
      }, 1500)
    }, 2000)
  }

  // Pagar Préstamo (Repay)
  const handleRepay = async (loanId, amount) => {
    const isMxnb = amount.includes('MXNB')

    if (isMxnb) {
      let switchToast
      try {
        switchToast = toast.loading('Switching to Arbitrum Sepolia...')
        await ensureArbitrumSepoliaNetwork(switchNetwork)
        toast.dismiss(switchToast)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const mxnb = new ethers.Contract(
          MXNB_ADDRESS,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          signer
        )
        const amountStr = amount.replace(' MXNB', '').trim()
        const amountWei = ethers.parseUnits(amountStr, 6)

        const txToast = toast.loading('Confirm MXNB payment in MetaMask...')
        const tx = await mxnb.transfer(MXNB_REPAY_POOL, amountWei)
        await tx.wait()
        toast.dismiss(txToast)
        toast.success(
          <span>
            MXNB payment confirmed!{' '}
            <a href={`https://sepolia.arbiscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View on Arbiscan
            </a>
          </span>,
          { duration: 8000 }
        )
      } catch (err) {
        if (switchToast) toast.dismiss(switchToast)
        toast.error('MXNB payment failed: ' + err.message)
        return
      }
    }

    const toastId = toast.loading(`Processing payment of ${amount}...`)

    setTimeout(() => {
      toast.dismiss(toastId)
      toast.success('Payment processed! Your on-chain reputation score has increased.')

      setMyLoans(prev => prev.map(loan => {
        if (loan.id === loanId) {
          return {
            ...loan,
            status: 'repaid',
            statusLabel: 'Repaid',
            nextPayment: '0.00 USDC',
            remainingDays: 0
          }
        }
        return loan
      }))

      // Actualizar score en localStorage para simular subida en la navbar
      const currentScore = parseInt(localStorage.getItem('reputationScore') || '300')
      const nextScore = currentScore + 25
      localStorage.setItem('reputationScore', nextScore.toString())
      // Disparar evento para actualizar navbar
      window.dispatchEvent(new Event('storage'))
    }, 1800)
  }

  const shortAddr = useMemo(() => {
    if (!address) return '0x0000...0000'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [address])

  return (
    <div className="loans-container">
      {/* Header */}
      <header className="loans-header">
        <h1 className="loans-title">Web3 Microloans</h1>
        <p className="loans-subtitle">
          CredLayer AI enables P2P lending and decentralized community funding, backed by on-chain reputation calculated in Arbitrum Stylus and Scroll.
        </p>
      </header>

      {/* Stats aggregados */}
      <section className="loans-stats">
        <article className="loan-stat-card loan-stat-card--mxnb">
          <span className="loan-stat-label loan-stat-label--mxnb" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="loan-stat-dot"></span>
            <ArbitrumIcon size={13} />
            MXNB Balance
          </span>
          <strong className="loan-stat-value loan-stat-value--mxnb">{Number(mxnbBalance).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</strong>
          <span className="loan-stat-hint loan-stat-hint--mxnb">Arbitrum Sepolia Live</span>
        </article>

        <LoanSparkline
          data={[40, 36, 38, 30, 32, 24, 26, 18, 20, 10, 12, 8, 4]}
          color="green"
          label="USDC en circulación · 24h"
          value={metrics.activePrincipalFormatted}
          delta="↑ 8.3%"
        />

        <article className="loan-stat-card">
          <span className="loan-stat-label">Average Rate</span>
          <strong className="loan-stat-value">{metrics.averageRate}</strong>
          <span className="loan-stat-hint">Democratically defined</span>
        </article>

        <article className="loan-stat-card">
          <span className="loan-stat-label">Funded Loans</span>
          <strong className="loan-stat-value">{metrics.fundedLoans}</strong>
          <span className="loan-stat-hint">Micro-business credits</span>
        </article>

        <article className="loan-stat-card">
          <span className="loan-stat-label">Active Funders</span>
          <strong className="loan-stat-value">{metrics.supporters}</strong>
          <span className="loan-stat-hint">Allies with reputation</span>
        </article>
      </section>

      {/* Endless Horizontal Backers Ticker (tasteskill.dev style) */}
      <section className="backers-ticker-section">
        <div className="backers-ticker-title">
          <Sparkles size={12} style={{ color: '#eab308' }} />
          Live Community Support Ticker
        </div>
        <div className="backers-ticker-viewport">
          <div className="backers-ticker-track" ref={tickerRef}>
            {[...SPONSORS, ...SPONSORS].map((sponsor, index) => (
              <div key={index} className="backers-ticker-card">
                <div className="ticker-card-top">
                  <span className="ticker-backer-name">{sponsor.name}</span>
                  <span className="ticker-backer-date">{sponsor.date}</span>
                </div>
                <div className="ticker-card-body">
                  <span className="ticker-backer-amount">{sponsor.amount}</span>
                  <span className="ticker-backer-tier">
                    {sponsor.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="loans-tabs">
        <button
          className={`loans-tab-btn ${activeTab === 'lend' ? 'active' : ''}`}
          onClick={() => setActiveTab('lend')}
        >
          <Users size={16} />
          Community Funding
        </button>
        <button
          className={`loans-tab-btn ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          <Wallet size={16} /> Request Credit
        </button>
        <button
          className={`loans-tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <CreditCard size={16} />
          My Loans
        </button>
      </nav>

      {/* TAB CONTENT: BORROW (SOLICITAR CRÉDITO) */}
      {activeTab === 'borrow' && (
        <section className="borrow-layout">
          {/* Form */}
          <div className="borrow-form-card hover-glow-card">
            <h2 className="borrow-form-title">New Credit Application</h2>
            <p className="borrow-form-subtitle">
              Configure the terms of your loan. When submitted, a smart contract will be created in Sepolia and your representative **Reputation-Credit NFT** will be minted.
            </p>

            <form onSubmit={handleCreateLoan}>
              <div className="form-group">
                <label className="form-label" htmlFor="purpose">Loan Purpose</label>
                <input
                  type="text"
                  id="purpose"
                  className="form-input"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ej. Purchase of supplies for bakery"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Amount (USDC)</label>
                  <input
                    type="number"
                    id="amount"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="50"
                    max="5000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="duration">Term (Days)</label>
                  <select
                    id="duration"
                    className="form-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="45">45 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="interest">Suggested Rate (% APR)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    id="interest"
                    className="form-input"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    step="0.1"
                    min="1.0"
                    max="15.0"
                    required
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>%</span>
                </div>
                
                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  background: 'rgba(59, 130, 246, 0.04)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  color: '#27272a',
                  lineHeight: '1.45'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: '700', color: '#1d4ed8' }}>
                    <Shield size={14} style={{ flexShrink: 0 }} />
                    <span>Trust Score On-Chain (Arbitrum Stylus)</span>
                  </div>
                  <p style={{ margin: 0, color: '#4b5563' }}>
                    Your interest rate is dynamically linked to your <strong>immutable, on-chain Trust Score</strong> calculated on Arbitrum Stylus. 
                    This is a verifiable reputation record, not a banking credit score. High reputation unlocks lower interest rates (down to 1.0% APR) and higher loan amounts.
                  </p>
                </div>
              </div>

              <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #e4e4e7' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>
                  <TrendingUp size={14} />
                  Estimated impact on reputation
                </span>
                <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '0.25rem 0 0' }}>
                  Repaying this loan on time will add **+{Math.round(parseFloat(amount || '0') * 0.05)} points** to your on-chain reputation score.
                </p>
              </div>

              <button type="submit" className="borrow-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Creating & Minting NFT...</>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Create & Mint Credit NFT
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive 3D NFT Card Preview & Bitso Simulator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="nft-preview-wrapper" style={{ minHeight: '440px', padding: '2.5rem 2rem' }}>
              <span className="nft-preview-label">3D Preview of Credit NFT</span>

              <div className="nft-scene">
                <div
                  ref={cardRef}
                  className="nft-card-3d state-pending"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  }}
                >
                  <div className="nft-card-inner">
                    {/* Glare overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
                        pointerEvents: 'none',
                        zIndex: 3
                      }}
                    />

                    <div className="nft-header">
                      <span className="nft-brand">CredLayer NFT</span>
                      <span className="nft-tag-chip">Pending</span>
                    </div>

                    <div className="nft-body">
                      <div className="nft-amount">${parseFloat(amount || '0').toLocaleString()} USDC</div>
                      <div className="nft-rate">{interest}% APR · {duration} Days</div>
                      <p className="nft-purpose">{purpose || 'No purpose specified...'}</p>
                    </div>

                    <div className="nft-footer">
                      <div className="nft-wallet">
                        <span className="nft-wallet-label">Borrower</span>
                        <span className="nft-wallet-addr">{shortAddr}</span>
                      </div>
                      <div className="nft-badge-meta">
                        <span className="nft-badge-score">{reputationScore || 300} PTS</span>
                        <span className="nft-badge-sub">Reputation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitso Rate Simulator Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00B15D, #00D67D)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>₿</span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0a0a0a' }}>Bitso Rate Simulator</h3>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00B15D', background: 'rgba(0,177,93,0.08)', padding: '3px 8px', borderRadius: '8px' }}>
                  Live API
                </span>
              </div>
              
              <p style={{ fontSize: '0.78rem', color: '#6b6b6b', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
                Simulate exchange rates between Mexican Pesos (MXN/MXNB) and USDC. Rates are fetched directly from Bitso.
              </p>

              <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '14px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>
                    {simDirection === 'MXN_TO_USDC' ? 'You Sell (MXN / MXNB)' : 'You Sell (USDC)'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSimDirection(d => d === 'MXN_TO_USDC' ? 'USDC_TO_MXN' : 'MXN_TO_USDC')}
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    Swap ⇆
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#0a0a0a',
                      outline: 'none',
                      padding: 0
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a0a0a' }}>
                    {simDirection === 'MXN_TO_USDC' ? 'MXN' : 'USDC'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0 8px 0', position: 'relative', zIndex: 2 }}>
                <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  ↓
                </div>
              </div>

              <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '14px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  {simDirection === 'MXN_TO_USDC' ? 'You Receive (USDC)' : 'You Receive (MXN / MXNB stablecoin)'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00B15D' }}>
                    {bitsoLoading ? '...' : 
                      simDirection === 'MXN_TO_USDC' 
                        ? (parseFloat(simAmount || '0') / bitsoRate).toFixed(2) 
                        : (parseFloat(simAmount || '0') * bitsoRate).toFixed(2)
                    }
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a0a0a' }}>
                    {simDirection === 'MXN_TO_USDC' ? 'USDC' : 'MXNB'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#888' }}>
                <span>Rate: 1 USD = <strong>{bitsoRate.toFixed(2)} MXN</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#00B15D', borderRadius: '50%', display: 'inline-block' }}></span>
                  Bitso live ticker
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: LEND (FONDEO COMUNITARIO) */}
      {activeTab === 'lend' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Coins size={24} style={{ color: '#3b82f6' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Earn interest by supporting your community</h3>
              <p style={{ fontSize: '0.85rem', color: '#71717a', margin: '0.2rem 0 0' }}>
                When you fund a loan, you receive a portion of the accumulated interest and are minted a **Backer NFT Certificate** that certifies your support history.
              </p>
            </div>
          </div>

          {isLoadingLoans ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="loans-grid">
              {availableLoans.map((loan) => (
                <article key={loan.id} className="market-loan-card">
                  <div className="market-card-top">
                    <span className="market-borrower-ens">{loan.borrower}</span>
                    <span className={`market-risk-badge risk-${loan.riskLevel.toLowerCase()}`}>
                      Riesgo: {loan.riskLevel}
                    </span>
                  </div>

                  <p className="market-purpose">{loan.purpose}</p>

                  <div className="market-stats-row">
                    <div className="market-stat">
                      <span className="market-stat-lbl">Amount</span>
                      <span className="market-stat-val">${loan.amount} {loan.currency}</span>
                    </div>
                    <div className="market-stat">
                      <span className="market-stat-lbl">Interest Rate</span>
                      <span className="market-stat-val">{loan.interestRate} APR</span>
                    </div>
                    <div className="market-stat">
                      <span className="market-stat-lbl">Term</span>
                      <span className="market-stat-val">{loan.durationDays} Days</span>
                    </div>
                  </div>

                  <div className="funding-progress-wrapper">
                    <div className="funding-progress-label">
                      <span style={{ color: '#71717a' }}>Current Funding</span>
                      <span>{loan.funded}%</span>
                    </div>
                    <div className="funding-progress-bar">
                      <div className="funding-progress-fill" style={{ width: `${loan.funded}%` }} />
                    </div>
                  </div>

                  <button
                    className="lend-btn"
                    onClick={() => handleLend(loan)}
                    disabled={isFunding === loan.id || loan.funded >= 100}
                  >
                    {isFunding === loan.id ? (
                      <>Funding...</>
                    ) : loan.funded >= 100 ? (
                      <>
                        <Check size={16} />
                        100% Funded
                      </>
                    ) : (
                      <>
                        <Wallet size={16} />
                        Fund with USDC
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* LATAM Credit Impact Bento Banner */}
          <div className="latam-impact-banner">
            <div className="latam-impact-text">
              <span className="latam-impact-tag">Regional Impact</span>
              <h3>Driving growth in Latin America</h3>
              <p>
                Each microloan funded through CredLayer directly empowers local entrepreneurs to expand their businesses and avoid abusive interest rates. Your financial support generates real value and strengthens the economic resilience of the community.
              </p>
              <div className="latam-impact-metrics">
                <div className="latam-metric">
                  <strong>+320</strong>
                  <span>Entrepreneurs</span>
                </div>
                <div className="latam-metric">
                  <strong>100%</strong>
                  <span>Web3 Transparency</span>
                </div>
              </div>
            </div>
            <div className="latam-impact-image-container">
              <img src={latamImg} alt="Community Impact in LATAM" className="latam-impact-img" />
              <div className="latam-impact-overlay"></div>
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: MY LOANS (MIS PRÉSTAMOS) */}
      {activeTab === 'my' && (
        <section>
          {myLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: '#fafafa', borderRadius: '24px', border: '1px dashed #e4e4e7' }}>
              <Landmark size={48} style={{ margin: '0 auto 1.5rem', color: '#a1a1aa' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>You don't have any active loans</h3>
              <p style={{ fontSize: '0.9rem', color: '#71717a', maxWidth: '360px', margin: '0.5rem auto 1.5rem' }}>
                Your reputation is intact. Go to the "Request Credit" section to mint your first Credit Card NFT.
              </p>
              <button className="borrow-submit-btn" style={{ width: 'auto', margin: '0 auto' }} onClick={() => setActiveTab('borrow')}>
                Request Now
              </button>
            </div>
          ) : (
            <div className="my-loans-list">
              {myLoans.map((loan) => (
                <article key={loan.id} className={`my-loan-card status-${loan.status}`}>
                  <div className="my-card-header">
                    <span className="my-card-status">
                      {loan.statusLabel || (loan.status === 'active' ? 'In Progress' : 'Liquidated')}
                    </span>
                    <span className="my-loan-impact">{loan.reputationImpact}</span>
                  </div>

                  <h3 className="my-loan-purpose">{loan.purpose}</h3>

                  <div className="my-loan-details">
                    <div className="my-detail-item">
                      <label>Amount</label>
                      <span>{loan.amount} {loan.currency}</span>
                    </div>
                    <div className="my-detail-item">
                      <label>Remaining Days</label>
                      <span>{loan.remainingDays} Days</span>
                    </div>
                    <div className="my-detail-item" style={{ gridColumn: 'span 2' }}>
                      <label>Next Payment</label>
                      <span>{loan.nextPayment}</span>
                    </div>
                  </div>

                  {loan.status === 'active' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="repay-btn repay-btn--usdc"
                        onClick={() => handleRepay(loan.id, loan.nextPayment)}
                      >
                        <Check size={16} />
                        Pay Installment (USDC)
                      </button>
                      <button
                        className="repay-btn repay-btn--mxnb"
                        onClick={() => {
                          const valInMxn = (parseFloat(loan.amount) * 17.5).toFixed(2);
                          handleRepay(loan.id, `${valInMxn} MXNB`);
                        }}
                      >
                        <Coins size={16} />
                        Pay with MXNB (~{(parseFloat(loan.amount) * 17.5).toFixed(0)} MXN)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <Award size={16} />
                      Paid Off (Score +25)
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MINTED BACKER CERTIFICATE NFT MODAL */}
      {showFunderModal && mintedFunderNft && (
        <div className="nft-modal-overlay">
          <div className="nft-modal-card">
            <div className="nft-modal-title">
              ¡Backer Certificate Minted!
            </div>

            {/* Visual Backer Certificate NFT */}
            <div className="visual-backer-nft">
              {/* Glowing ring */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(234, 179, 8, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.1em', color: '#eab308' }}>
                  CREDLAYER BACKER
                </span>
                <Award size={18} style={{ color: '#eab308' }} />
              </div>

              <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '900', textAlign: 'left', lineHeight: '1.1' }}>
                CERTIFICATE OF SUPPORT
              </div>

              <div style={{ textAlign: 'left', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#71717a' }}>Soporte a:</span>
                  <span style={{ fontWeight: 'bold' }}>{mintedFunderNft.borrower}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#71717a' }}>Monto Fondeado:</span>
                  <span style={{ fontWeight: 'bold' }}>{mintedFunderNft.amount} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#71717a' }}>Tasa Compartida:</span>
                  <span style={{ fontWeight: 'bold' }}>{mintedFunderNft.interest}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#71717a' }}>Tipo de Insignia:</span>
                  <span style={{ fontWeight: 'bold', color: '#eab308' }}>{mintedFunderNft.badgeType}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingParent: '1rem', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.55rem', color: '#71717a' }}>PROVEEDOR</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{mintedFunderNft.backer}</span>
                </div>
                <span style={{ fontSize: '0.65rem', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  SCORE +10
                </span>
              </div>
            </div>

            <p className="nft-modal-subtitle">
              This dynamic NFT has been issued to your address and increases your credit reputation in the ecosystem.
            </p>

            <button className="nft-modal-btn" onClick={() => setShowFunderModal(false)}>
              Ready, continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Loans
