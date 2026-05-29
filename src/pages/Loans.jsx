// src/pages/Loans.jsx
// CredLayer AI — Módulo de Microcréditos y Reputación Web3 con NFTs Dinámicos

import React, { useState, useEffect, useRef, useMemo } from 'react'
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
  Percent
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import '../styles/loans.css'

const Loans = () => {
  const { address, reputationScore } = useWalletConnection()
  const { data: initialLoansData, isLoading: isLoadingLoans } = useLoansData(address)

  // Balance MXNB
  const [mxnbBalance, setMxnbBalance] = useState('0.00')

  useEffect(() => {
    if (!address) {
      setMxnbBalance('0.00')
      return
    }
    const fetchMxnb = async () => {
      try {
        const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc')
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
    if (amount.includes('MXNB')) {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x66eee' }], // Arbitrum Sepolia
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x66eee',
                    chainName: 'Arbitrum Sepolia Testnet',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
                    blockExplorerUrls: ['https://sepolia.arbiscan.io/']
                  }
                ]
              });
            } catch (addError) {
              toast.error("Failed to add Arbitrum Sepolia network.");
              return;
            }
          } else {
            toast.error("Failed to switch network: " + switchError.message);
            return;
          }
        }
      } else {
        toast.error("Wallet not detected. Please install a Web3 wallet.");
        return;
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
        <article className="loan-stat-card border-emerald-500/20 bg-emerald-50/10">
          <span className="loan-stat-label text-emerald-600 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MXNB Balance
          </span>
          <strong className="loan-stat-value text-emerald-600">{Number(mxnbBalance).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</strong>
          <span className="loan-stat-hint text-emerald-500/80">Arbitrum Sepolia Live</span>
        </article>

        <article className="loan-stat-card">
          <span className="loan-stat-label">Active Principal</span>
          <strong className="loan-stat-value">{metrics.activePrincipalFormatted}</strong>
          <span className="loan-stat-hint">USDC in circulation</span>
        </article>

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

              <button type="submit" className="borrow-submit-btn bg-black text-white hover:bg-zinc-800 transition-colors" disabled={isSubmitting}>
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

          {/* Interactive 3D NFT Card Preview */}
          <div className="nft-preview-wrapper">
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
                    className="lend-btn bg-black text-white hover:bg-zinc-800 transition-colors"
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
                      {loan.statusLabel || (loan.status === 'active' ? 'En Curso' : 'Liquidado')}
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
                        className="repay-btn bg-emerald-500 text-white hover:bg-emerald-600 transition-colors w-full flex items-center justify-center gap-1.5"
                        onClick={() => handleRepay(loan.id, loan.nextPayment)}
                      >
                        <Check size={16} />
                        Pay Installment (USDC)
                      </button>
                      <button
                        className="repay-btn bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-1.5"
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
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
              border: '2px solid #eab308',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
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
