import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { usePaymentsData } from '../hooks/usePaymentsData'
import { Send, ExternalLink, Clock, CheckCircle, ChevronDown, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ethers } from 'ethers'
import { useTrustScore } from '../hooks/useCredLayer'
import { SEPOLIA_CHAIN_ID, ARBITRUM_SEPOLIA_CHAIN_ID, ensureSepoliaNetwork, ensureArbitrumSepoliaNetwork, notifyTransactionsUpdated } from '../config/chains'
import '../styles/payments.css'

// ─── Contract ─────────────────────────────────────────────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const USDC_SEPOLIA      = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const MXNB_ADDRESS      = '0xf197ffc28c23e0309b5559e7a166f2c6164c80aa'

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

const TOKENS = [
  { symbol: 'USDC', network: 'Ethereum Sepolia' },
  { symbol: 'MXNB', network: 'Arbitrum Sepolia' },
  { symbol: 'ETH',  network: 'Coming soon',      disabled: true },
]

// ─── Component ─────────────────────────────────────────────────────────────────
const Payments = () => {
  const navigate = useNavigate()
  const { userProfile, address, updateScore, reputationScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { score: onChainScore } = useTrustScore()
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePaymentsData(address)
  const { setPageIntent, updatePageContext } = useAiAssistantContext()

  const [paymentForm, setPaymentForm]   = useState({ to: '', amount: '', memo: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [lastTxHash, setLastTxHash]     = useState('')
  const [selectedToken, setSelectedToken] = useState('USDC')

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

  const pageRef      = useRef(null)
  const scoreBarRef  = useRef(null)
  const scoreNumRef  = useRef(null)
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
  const history         = paymentsData?.history
  const recentPayments  = useMemo(() => history ?? [], [history])
  const score           = onChainScore > 0 ? onChainScore : (reputationScore ?? 0)
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

    try {
      setIsProcessing(true)
      setLastTxHash('')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const network  = await provider.getNetwork()
      const isMxnb   = selectedToken === 'MXNB'
      const targetChainId   = isMxnb ? ARBITRUM_SEPOLIA_CHAIN_ID : SEPOLIA_CHAIN_ID
      const targetChainName = isMxnb ? 'Arbitrum Sepolia' : 'Sepolia'

      // ── Switch network if needed ──────────────────────────────────────────
      if (Number(network.chainId) !== targetChainId) {
        setProcessingStep(`Switching to ${targetChainName}...`)
        if (isMxnb) {
          await ensureArbitrumSepoliaNetwork(switchNetwork)
        } else {
          await ensureSepoliaNetwork(switchNetwork)
        }
        await new Promise(r => setTimeout(r, 1500))
      }

      const signer = await provider.getSigner()

      // ── MXNB on Arbitrum Sepolia → direct ERC20 transfer ─────────────────
      // CredLayer contract only exists on Ethereum Sepolia, so MXNB payments
      // are executed as a plain ERC20 transfer to the recipient.
      if (isMxnb) {
        const mxnbContract = new ethers.Contract(MXNB_ADDRESS, ERC20_ABI, signer)

        // MXNB uses 6 decimals (same as USDC)
        let decimals = 6
        try { decimals = Number(await mxnbContract.decimals()) } catch (_) { }

        const amountWei = ethers.parseUnits(String(amountFloat), decimals)
        setProcessingStep('Sending MXNB...')
        const tx = await mxnbContract.transfer(paymentForm.to, amountWei)
        await tx.wait()

        setLastTxHash(tx.hash)
        const newTx = {
          id: Date.now(),
          type: 'Income',
          amount: `+${paymentForm.amount} MXNB`,
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
            <div style={{ fontWeight: 700, marginBottom: 4 }}>MXNB transferred on-chain ✓</div>
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
      const credlayer    = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, signer)
      const tokenContract = new ethers.Contract(USDC_SEPOLIA, ERC20_ABI, signer)
      const decimals     = 6
      const amountWei    = ethers.parseUnits(String(amountFloat), decimals)
      const raw          = `${paymentForm.to}-${amountFloat}-${paymentForm.memo}-${Date.now()}`
      const proofHash    = ethers.keccak256(ethers.toUtf8Bytes(raw))

      setProcessingStep('Approving USDC...')
      const allowance = await tokenContract.allowance(address, CREDLAYER_ADDRESS)
      if (allowance < amountWei) {
        const txApprove = await tokenContract.approve(CREDLAYER_ADDRESS, amountWei)
        await txApprove.wait()
        toast.success('USDC approved')
      }

      setProcessingStep('Registering on-chain...')
      const tx = await credlayer.registerPayment(paymentForm.to, amountWei, proofHash)
      await tx.wait()

      setLastTxHash(tx.hash)
      const newTx = {
        id: Date.now(),
        type: 'Income',
        amount: `+${paymentForm.amount} USDC`,
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
      toast.error(`Payment error: ${err.message}`)
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
            <button className="pay-submit" type="submit" disabled={isProcessing || !address}>
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
                const isMxnb = displayTok === 'MXNB'
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
                          href={getExplorerUrl(txHash, isMxnb)}
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