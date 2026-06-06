import React, { useState, useMemo, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import { useNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { User, Shield, Star, Settings, Edit3, Save, X, Sparkles, ShieldCheck, Wallet, ChevronRight, Globe, Twitter, TrendingUp, Activity } from 'lucide-react'
import { useWalletConnection } from '../hooks/useWalletConnection'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ReputationOnchainService } from '../services/ReputationOnchain'
import founderAvatar from '../assets/founder_avatar.png'

gsap.registerPlugin(ScrollTrigger)

const PROFILE_STATS = [
  { label: 'Transactions', icon: Activity, value: 45, color: 'from-[#F59E0B] to-[#FBBF24]' },
  { label: 'Total Volume', icon: TrendingUp, value: '$1,250', color: 'from-[#8B5CF6] to-[#A78BFA]' },
  { label: 'Avg Rating', icon: Star, value: '4.8', color: 'from-[#F59E0B] to-[#8B5CF6]' },
  { label: 'Platform Days', icon: Shield, value: 120, color: 'from-[#8B5CF6] to-[#6D28D9]' }
]

const REPUTATION_LEVELS = [
  { min: 0, max: 199, level: 'Beginner', color: '#9CA3AF', glow: 'rgba(156,163,175,0.15)', benefits: ['Basic payments'] },
  { min: 200, max: 399, level: 'Intermediate', color: '#6B7280', glow: 'rgba(107,114,128,0.15)', benefits: ['Small microloans', 'Standard rates'] },
  { min: 400, max: 599, level: 'Advanced', color: '#4B5563', glow: 'rgba(75,85,99,0.15)', benefits: ['Medium loans', 'Reduced rates'] },
  { min: 600, max: 799, level: 'Expert', color: '#1F2937', glow: 'rgba(31,41,55,0.15)', benefits: ['Large loans', 'Low rates', 'Priority support'] },
  { min: 800, max: 1000, level: 'Master', color: '#000000', glow: 'rgba(0,0,0,0.15)', benefits: ['No limits', 'Minimum rates', 'Exclusive access'] }
]

// Branded Switch component using design system colors
const Switch = ({ checked = false, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      defaultChecked={checked}
      onChange={onChange}
    />
    <div className="w-11 h-6 bg-[#E5E7EB] border border-[#D1D5DB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
  </label>
)

const Profile = () => {
  const { userProfile, address, reputationScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { setPageIntent, updatePageContext } = useAiAssistantContext()
  const [onchainScore, setOnchainScore] = useState(null)
  const repContractAddress = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REPUTATION_ENS_ADDRESS) || ''

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    ensName: userProfile?.ensName || '',
    description: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      website: ''
    }
  })

  const pageRef = useRef(null)

  const networkName = chain?.name || 'Network not detected'
  const shortAddress = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet connected'), [address])

  const currentLevel = useMemo(() => {
    return REPUTATION_LEVELS.find(level => (reputationScore || 0) >= level.min && (reputationScore || 0) <= level.max) || REPUTATION_LEVELS[0]
  }, [reputationScore])

  const progressPercent = Math.min(((onchainScore ?? reputationScore) || 0) / 10, 100)
  const displayScore = onchainScore ?? reputationScore ?? 0

  useEffect(() => {
    setPageIntent('profile-advice')
    return () => {
      setPageIntent('general')
      updatePageContext({}, { replace: true })
    }
  }, [setPageIntent, updatePageContext])

  useEffect(() => {
    let cancelled = false
    async function fetchScore() {
      try {
        if (!repContractAddress || !address) return
        const svc = new ReputationOnchainService(repContractAddress)
        const score = await svc.getScore(address)
        if (!cancelled) setOnchainScore(Number(score))
      } catch (_) {}
    }
    fetchScore()
    return () => { cancelled = true }
  }, [repContractAddress, address])

  const handleBumpReputation = useCallback(async () => {
    try {
      if (!repContractAddress || !address) {
        toast.success('Reputation +5 (demo) - Contract not detected')
        return
      }
      const svc = new ReputationOnchainService(repContractAddress)
      await svc.bump(address, 5)
      const score = await svc.getScore(address)
      setOnchainScore(Number(score))
      toast.success('Reputation +5')
    } catch (error) {
      toast.error('Could not update reputation')
    }
  }, [repContractAddress, address])

  useEffect(() => {
    updatePageContext(
      {
        section: 'profile',
        ensName: userProfile?.ensName,
        reputationScore,
        network: networkName,
        level: currentLevel,
        stats: PROFILE_STATS,
        registered: userProfile?.isRegistered
      },
      { replace: true }
    )
  }, [userProfile, reputationScore, networkName, currentLevel, updatePageContext])

  const handleSaveProfile = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 900))
      setIsEditing(false)
      toast.success('Profile updated (demo).')
    } catch (error) {
      toast.error(`Error updating profile: ${error.message}`)
    }
  }, [])

  const handleChangeSocial = useCallback((key, value) => {
    setProfileData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }))
  }, [])

  useLayoutEffect(() => {
    let lenis
    let ctx

    try {
      lenis = new Lenis({ duration: 1.2, smooth: true })

      function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)

      ctx = gsap.context(() => {
        gsap.from('.hero-element', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        })

        gsap.from('.stagger-item', {
          scrollTrigger: {
            trigger: '.animate-section',
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        })

        if (document.querySelector('.progress-bar')) {
          gsap.fromTo('.progress-bar',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 1.5, ease: 'power3.out', delay: 0.5 }
          )
        }
      }, pageRef)
    } catch (error) {
      console.error(error)
    }

    return () => {
      if (lenis) lenis.destroy()
      if (ctx) ctx.revert()
    }
  }, [])

  return (
    <div
      ref={pageRef}
      className="min-h-screen pb-24 w-full"
      style={{ background: '#FFFFFF', fontFamily: "'Inter', sans-serif", color: '#000000' }}
    >

      {/* ══════════════════════════════════
          HERO SECTION
      ══════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-10 pb-16 border-b max-w-6xl mx-auto" style={{ borderColor: '#E5E5E5' }}>

        {/* Network + wallet badges */}
        <div className="hero-element mb-8 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#F3F4F6', border: '1px solid #E5E5E5', color: '#000000' }}
          >
            <Sparkles size={13} />
            {networkName}
          </span>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold font-mono"
            style={{ background: '#F3F4F6', border: '1px solid #E5E5E5', color: '#000000' }}
          >
            <Wallet size={13} />
            {shortAddress}
          </span>
          {userProfile?.isRegistered ? (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: '#F3F4F6', border: '1px solid #E5E5E5', color: '#000000' }}
            >
              <ShieldCheck size={13} /> Verified
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: '#F3F4F6', border: '1px solid #E5E5E5', color: '#000000' }}
            >
              <ShieldCheck size={13} /> Pending Registration
            </span>
          )}
        </div>

        {/* Profile card */}
        <div
          className="hero-element flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl relative overflow-hidden"
          style={{ background: '#F9FAFB', border: '1px solid #E5E5E5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
        >
          {/* Avatar (B&W Founder portrait) */}
          <div className="relative flex-shrink-0">
            <img
              src={founderAvatar}
              alt={userProfile?.ensName || 'Founder'}
              className="w-24 h-24 rounded-2xl object-cover border border-[#E5E5E5] shadow-sm"
              style={{
                filter: 'grayscale(100%) contrast(110%)'
              }}
            />
            {/* Online dot */}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{ background: '#000000', borderColor: '#FFFFFF' }}
            />
          </div>

          {/* Identity info */}
          <div className="flex-grow text-center md:text-left">
            <h1
              className="text-2xl md:text-3xl font-extrabold mb-1"
              style={{ color: '#000000', letterSpacing: '-0.03em' }}
            >
              {userProfile?.ensName || 'No ENS Profile'}
            </h1>
            <p className="text-xs font-mono mb-5" style={{ color: '#6B7280' }}>{address}</p>

            {/* Reputation progress */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span style={{ color: '#000000' }}>{currentLevel.level}</span>
                <span style={{ color: '#6B7280' }}>{displayScore} / 1000 pts</span>
              </div>
              <div
                className="h-2.5 w-full rounded-full overflow-hidden relative"
                style={{ background: '#E5E7EB' }}
              >
                <div
                  className="progress-bar h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${progressPercent}%`,
                    background: '#000000'
                  }}
                >
                  {/* Shimmer animation */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                border: '1px solid #000000'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222222' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000000' }}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MAIN CONTENT GRID
      ══════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-section">

        {/* ── Main Column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Information Card */}
          <section
            className="stagger-item rounded-3xl p-8 relative overflow-hidden transition-all duration-300"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2
                className="text-xl font-bold"
                style={{ color: '#000000', letterSpacing: '-0.02em' }}
              >
                Personal Information
              </h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                    style={{ background: '#000000', color: '#FFFFFF' }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                    style={{ background: '#FFFFFF', color: '#000000', border: '1px solid #E5E5E5' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#6B7280' }}>Primary ENS</label>
                {isEditing ? (
                  <input
                    value={profileData.ensName}
                    onChange={e => setProfileData(prev => ({ ...prev, ensName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono transition-all duration-200 outline-none"
                    placeholder="name.eth"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#000000'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#000000' }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm font-mono"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#000000' }}
                  >
                    {userProfile?.ensName || 'Not configured'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1.5"><Twitter size={12} /> Twitter / X</span>
                </label>
                {isEditing ? (
                  <input
                    value={profileData.socialLinks.twitter}
                    onChange={e => handleChangeSocial('twitter', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    placeholder="https://twitter.com/..."
                    style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#000000' }}
                    onFocus={e => { e.target.style.borderColor = '#000000' }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#000000' }}
                  >
                    {profileData.socialLinks.twitter || 'Not connected'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1.5"><Globe size={12} /> Website</span>
                </label>
                {isEditing ? (
                  <input
                    value={profileData.socialLinks.website}
                    onChange={e => handleChangeSocial('website', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    placeholder="https://..."
                    style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#000000' }}
                    onFocus={e => { e.target.style.borderColor = '#000000' }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#000000' }}
                  >
                    {profileData.socialLinks.website || 'Not configured'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-2" style={{ color: '#6B7280' }}>Biography</label>
                {isEditing ? (
                  <textarea
                    value={profileData.description}
                    onChange={e => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none resize-none"
                    placeholder="Share your story..."
                    style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#000000' }}
                    onFocus={e => { e.target.style.borderColor = '#000000' }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm min-h-[100px] whitespace-pre-wrap"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#374151' }}
                  >
                    {profileData.description || 'No biography added yet.'}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── SECTION: ON-CHAIN REPUTATION EXPLANATION ── */}
          <section
            className="stagger-item rounded-3xl p-8 relative overflow-hidden transition-all duration-300 animate-section"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <h2
              className="text-xl font-bold mb-4 flex items-center gap-2"
              style={{ color: '#000000', letterSpacing: '-0.02em' }}
            >
              <ShieldCheck size={22} />
              On-Chain Reputation
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Unlike traditional credit scores managed by centralized agencies, your creditworthiness and reputation are completely <strong>sovereign, decentralized, and verifiable on-chain</strong>. It operates as a dynamic cryptographic metric representing your reliability in this peer-to-peer ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E5E5E5' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">How it is calculated</h3>
                <ul className="text-xs space-y-2 text-gray-600" style={{ paddingLeft: '5px' }}>
                  <li>• Volume and frequency of verified transfers</li>
                  <li>• History of early/on-time repayments</li>
                  <li>• Longevity of the active on-chain address</li>
                  <li>• Social endorsements and backing relationships</li>
                </ul>
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E5E5E5' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Technical Execution</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Your profile operates via a <strong>Reputation NFT</strong>. The mathematical calculations are performed on-chain using <strong>Arbitrum Stylus Smart Contracts</strong> written in Rust/Wasm, allowing gas-free scaling and transparent verification.
                </p>
              </div>
            </div>
          </section>

          {/* Reputation System Card */}
          <section
            className="stagger-item rounded-3xl p-8 relative overflow-hidden transition-all duration-300"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: '#000000', letterSpacing: '-0.02em' }}
                >
                  Reputation System
                </h2>
                <p className="text-xs leading-relaxed max-w-md" style={{ color: '#6B7280' }}>
                  Your score updates with every payment, loan, and community participation on the network.
                </p>
              </div>
              <button
                onClick={handleBumpReputation}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  color: '#000000'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                <Star size={13} />
                +5 Pts (Demo)
              </button>
            </div>

            {/* Level badges grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {REPUTATION_LEVELS.map((level, i) => {
                const isActive = currentLevel.level === level.level
                return (
                  <div
                    key={i}
                    className="text-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: isActive ? '#000000' : '#FFFFFF',
                      border: `1px solid ${isActive ? '#000000' : '#E5E5E5'}`,
                      color: isActive ? '#FFFFFF' : '#9CA3AF'
                    }}
                  >
                    {level.level}
                  </div>
                )
              })}
            </div>

            {/* Active benefits */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
            >
              <h4
                className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ color: '#000000' }}
              >
                <Star size={15} />
                Active Benefits — {currentLevel.level}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLevel.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-xs px-4 py-2.5 rounded-xl"
                    style={{ background: '#F9FAFB', border: '1px solid #E5E5E5', color: '#000000' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: '#000000' }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-8">

          {/* Stats Grid */}
          <section
            className="stagger-item rounded-3xl p-6 relative overflow-hidden"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <h2
              className="text-sm font-bold mb-5"
              style={{ color: '#000000' }}
            >
              Personal Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PROFILE_STATS.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl relative overflow-hidden transition-all duration-300"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: '#F3F4F6' }}
                    >
                      <Icon size={15} style={{ color: '#000000' }} />
                    </div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: '#6B7280' }}>{stat.label}</p>
                    <p className="text-lg font-extrabold font-mono" style={{ color: '#000000' }}>{stat.value}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Preferences */}
          <section
            className="stagger-item rounded-3xl p-6 relative overflow-hidden"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <h2
              className="text-sm font-bold mb-5"
              style={{ color: '#000000' }}
            >
              Preferences
            </h2>
            <div className="space-y-5">
              {[
                { label: 'Public Profile', desc: 'Allow others to view your bio', defaultOn: true },
                { label: 'Show Balances', desc: 'Display USDC on profile', defaultOn: false },
                { label: 'Notifications', desc: 'Receive payment alerts', defaultOn: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#000000' }}>{pref.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{pref.desc}</p>
                  </div>
                  <Switch checked={pref.defaultOn} />
                </div>
              ))}
            </div>
          </section>

          {/* Network info */}
          <section
            className="stagger-item rounded-3xl p-6 relative overflow-hidden"
            style={{ background: '#F9FAFB', border: '1px solid #E5E5E5' }}
          >
            <h2
              className="text-sm font-bold mb-4"
              style={{ color: '#000000' }}
            >
              Network
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#6B7280' }}>Chain</span>
                <span className="font-mono font-bold" style={{ color: '#000000' }}>{networkName}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ background: '#E5E5E5' }}
              />
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#6B7280' }}>Address</span>
                <span className="font-mono font-bold" style={{ color: '#000000' }}>{shortAddress}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ background: '#E5E5E5' }}
              />
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#6B7280' }}>Level</span>
                <span
                  className="font-bold px-2 py-0.5 rounded-md text-[10px]"
                  style={{
                    background: '#000000',
                    color: '#FFFFFF'
                  }}
                >
                  {currentLevel.level}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

export default Profile
