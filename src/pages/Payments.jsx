import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
import { useNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { usePaymentsData } from '../hooks/usePaymentsData'
import { Send, ArrowRight, Sparkles, ShieldCheck, Wallet, ArrowRightCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ethers } from 'ethers'

// ─── Contrato CredLayerCore desplegado en Sepolia ───────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

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
// ────────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger)

const feeInsights = [
  {
    title: 'Community Fee',
    description: '1% of each payment enters the cooperative fund to reinvest in local businesses.'
  },
  {
    title: 'Gas on Sepolia',
    description: 'Testnet transactions confirm in ~15 seconds with near-zero cost.'
  }
]

const Payments = () => {
  const { userProfile, address, reputationScore, updateScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePaymentsData(address)
  const { setPageIntent, updatePageContext } = useAiAssistantContext()
  const [paymentForm, setPaymentForm] = useState({ to: '', amount: '', memo: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('') // feedback de pasos
  const [lastTxHash, setLastTxHash] = useState('')         // hash de la última tx
  const [advancedId, setAdvancedId] = useState('')
  const pageRef = useRef(null)
  const networkName = chain?.name || 'Network not detected'

  useEffect(() => {
    setPageIntent('payments-advice')
    updatePageContext({
      currentForm: paymentForm,
      network: networkName,
    })
  }, [paymentForm, networkName, setPageIntent, updatePageContext])

  // ─── Obtener signer y contratos ───────────────────────────────────────────
  const getContracts = useCallback(async () => {
    if (!window?.ethereum) throw new Error('Wallet not detected')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const credlayer = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, signer)
    const usdc = new ethers.Contract(USDC_SEPOLIA, ERC20_ABI, signer)
    return { signer, credlayer, usdc }
  }, [])

  // ─── handleSendPayment — flujo: approve → registerPayment ─────────────────
  const handleSendPayment = async (e) => {
    e.preventDefault()

    if (!userProfile?.isRegistered) {
      toast.error('You must be registered in CredLayer AI to send payments')
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

      // Convertir a 6 decimales (USDC)
      const amountWei = ethers.parseUnits(String(amountFloat), 6)

      // Generar proofHash a partir de los datos del pago
      const raw = `${paymentForm.to}-${amountFloat}-${paymentForm.memo}-${Date.now()}`
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(raw))

      // PASO 1 — Approve USDC al contrato CredLayerCore
      setProcessingStep('Approving USDC...')
      const allowance = await usdc.allowance(address, CREDLAYER_ADDRESS)
      if (allowance < amountWei) {
        const txApprove = await usdc.approve(CREDLAYER_ADDRESS, amountWei)
        await txApprove.wait()
        toast.success('✅ USDC approved')
      }

      // PASO 2 — Registrar el pago en el contrato
      setProcessingStep('Registering on-chain...')
      const tx = await credlayer.registerPayment(paymentForm.to, amountWei, proofHash)
      await tx.wait()

      // Éxito
      setLastTxHash(tx.hash)
      updateScore(12)

      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-black">Payment Verified On-Chain! ✅</span>
            <span className="text-[10px] font-mono opacity-50 truncate w-48">{tx.hash}</span>
            <a
              href={getExplorerUrl(tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-blue-600 underline"
            >
              View on Sepolia Etherscan →
            </a>
            <span className="text-[10px] font-bold text-green-600">+12 Trust Score</span>
          </div>
        ),
        { duration: 8000 }
      )

      setPaymentForm({ to: '', amount: '', memo: '' })

    } catch (error) {
      toast.error(`Payment error: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────
  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet connected'),
    [address]
  )

  const paymentsMetrics = paymentsData?.metrics
  const history = paymentsData?.history
  const recentPayments = useMemo(() => history ?? [], [history])

  const statCards = useMemo(() => [
    {
      value: paymentsMetrics?.totalVolumeUsdFormatted ?? '$0.00',
      label: 'Sent volume (30 days)'
    },
    {
      value: paymentsMetrics?.completedThisMonth != null ? `${paymentsMetrics.completedThisMonth}` : '0',
      label: 'Payments completed this month'
    },
    {
      value: paymentsMetrics?.successRateFormatted ?? '--',
      label: `Success rate ${chain ? `on ${networkName}` : ''}`.trim()
    }
  ], [paymentsMetrics, chain, networkName])

  const formatPaymentDate = useCallback((timestamp) => {
    if (!timestamp) return '--'
    try {
      return new Date(timestamp).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    } catch (_) {
      return timestamp
    }
  }, [])

  useEffect(() => {
    setPageIntent('payments-advice')
    return () => {
      setPageIntent('general')
      updatePageContext({}, { replace: true })
    }
  }, [setPageIntent, updatePageContext])

  useLayoutEffect(() => {
    let lenis, ctx
    try {
      lenis = new Lenis({ duration: 1.2, smooth: true })
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)

      ctx = gsap.context(() => {
        gsap.from('.hero-element', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out' })
        gsap.from('.stagger-item', {
          scrollTrigger: { trigger: '.animate-section', start: 'top 85%' },
          y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        })
      }, pageRef)
    } catch (error) {
      console.error(error)
    }
    return () => { if (lenis) lenis.destroy(); if (ctx) ctx.revert() }
  }, [])

  return (
    <div ref={pageRef} className="bg-white font-sans text-black w-full min-h-screen pb-20">

      {/* Hero Section */}
      <section className="min-h-[40vh] flex flex-col items-center justify-center relative px-6 w-full pt-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="hero-element mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles size={16} /> {networkName}
            </span>
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Wallet size={16} /> {shortAddress}
            </span>
            {userProfile?.isRegistered ? (
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <ShieldCheck size={16} /> Verified User
                <span className="ml-2 bg-green-200 text-green-900 px-2 py-0.5 rounded-full text-xs">{reputationScore ?? 0} pts</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <ShieldCheck size={16} /> Pending Registration
              </span>
            )}
          </div>

          <h1 className="hero-element text-5xl md:text-7xl font-extrabold tracking-tight text-black mb-6">
            Web3 P2P Payments.
          </h1>
          <p className="hero-element text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
            CredLayer AI registers every transfer on Sepolia, building your verifiable Trust Score on-chain.
          </p>

          <div className="hero-element flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => document.getElementById('terminal-section').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors"
            >
              <ArrowRightCircle size={20} /> Start Transfer
            </button>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="animate-section py-12 px-6 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12" id="terminal-section">

        {/* Terminal Form */}
        <div className="stagger-item lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:border-black transition-colors duration-300">
            <div className="mb-8">
              <span className="text-xs font-bold bg-gray-100 text-black px-3 py-1 rounded-full mb-4 inline-block">P2P Terminal · Sepolia</span>
              <h2 className="text-2xl font-bold text-black mb-2">Register Payment On-Chain</h2>
              <p className="text-gray-500 text-sm">Every transfer is verified on Ethereum Sepolia and boosts your Trust Score.</p>
            </div>

            <form onSubmit={handleSendPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={paymentForm.to}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="0x..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Amount (USDC)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Optional Memo</label>
                  <input
                    type="text"
                    value={paymentForm.memo}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="Payment description..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !userProfile?.isRegistered}
                className="w-full flex justify-center items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Clock size={18} className="animate-spin" /> {processingStep || 'Processing...'}</>
                ) : (
                  <><Send size={18} /> Send & Verify On-Chain</>
                )}
              </button>

              {!userProfile?.isRegistered && (
                <p className="text-sm text-orange-600 font-medium text-center">⚠️ Complete CredLayer AI registration to operate payments.</p>
              )}
            </form>

            {/* Último tx hash verificable */}
            {lastTxHash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-xs font-bold text-green-700 mb-1">✅ Last verified transaction</p>
                <p className="text-xs font-mono text-gray-500 truncate mb-2">{lastTxHash}</p>
                <a
                  href={getExplorerUrl(lastTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <ExternalLink size={12} /> View on Sepolia Etherscan
                </a>
              </div>
            )}

            {/* Sección Advanced */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <label className="block text-sm font-bold text-black mb-2">Advanced: paymentId</label>
              <div className="flex gap-4 items-center flex-wrap">
                <input
                  type="number"
                  value={advancedId}
                  onChange={(e) => setAdvancedId(e.target.value)}
                  placeholder="1"
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-100 text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  onClick={() => toast('Use Sepolia Etherscan to look up payment IDs', { icon: 'ℹ️' })}
                >
                  Lookup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="stagger-item bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-black mb-6">Network Summary</h3>
            <div className="space-y-6">
              {statCards.map((stat) => (
                <div key={stat.label}>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <strong className="text-2xl font-extrabold text-black">{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="stagger-item bg-white border border-gray-200 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-black mb-6">Costs & Experience</h3>
            <div className="space-y-6">
              {feeInsights.map((insight) => (
                <div key={insight.title}>
                  <p className="text-sm font-bold text-black mb-1">{insight.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contract info card */}
          <div className="stagger-item bg-black text-white rounded-3xl p-8">
            <h3 className="text-sm font-bold mb-3 opacity-60">Live Contract</h3>
            <p className="text-xs font-mono break-all opacity-80 mb-3">{CREDLAYER_ADDRESS}</p>
            <a
              href={`https://sepolia.etherscan.io/address/${CREDLAYER_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300"
            >
              <ExternalLink size={12} /> Verify on Etherscan
            </a>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="animate-section py-12 px-6 w-full max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-black">Recent Activity</h2>
          {paymentsData?.lastSync && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Last sync: {formatPaymentDate(paymentsData.lastSync)}
            </span>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          {isPaymentsLoading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Syncing history...</div>
          ) : recentPayments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="stagger-item p-6 hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 text-black p-3 rounded-2xl">
                      <ArrowRightCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-black text-lg">${payment.amount} USDC</p>
                      <p className="text-sm text-gray-500">To: {payment.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block mb-1 px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {payment.status === 'completed' ? 'Verified On-Chain' : 'Pending'}
                    </span>
                    <p className="text-sm text-gray-500 block">{formatPaymentDate(payment.timestamp || payment.date)}</p>
                    {payment.txHash && (
                      <a
                        href={getExplorerUrl(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <ExternalLink size={10} /> Etherscan
                      </a>
                    )}
                    {payment.memo && <p className="text-xs text-gray-400 mt-1">Note: {payment.memo}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 font-medium text-lg">No payments registered yet. Send your first verified transfer!</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

export default Payments