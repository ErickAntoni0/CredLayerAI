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

gsap.registerPlugin(ScrollTrigger)

const PROFILE_STATS = [
  { label: 'Transactions', icon: Activity, value: 45, color: 'from-[#F59E0B] to-[#FBBF24]' },
  { label: 'Total Volume', icon: TrendingUp, value: '$1,250', color: 'from-[#8B5CF6] to-[#A78BFA]' },
  { label: 'Avg Rating', icon: Star, value: '4.8', color: 'from-[#F59E0B] to-[#8B5CF6]' },
  { label: 'Platform Days', icon: Shield, value: 120, color: 'from-[#8B5CF6] to-[#6D28D9]' }
]

const REPUTATION_LEVELS = [
  { min: 0, max: 199, level: 'Beginner', color: '#94A3B8', glow: 'rgba(148,163,184,0.3)', benefits: ['Basic payments'] },
  { min: 200, max: 399, level: 'Intermediate', color: '#F59E0B', glow: 'rgba(245,158,11,0.3)', benefits: ['Small microloans', 'Standard rates'] },
  { min: 400, max: 599, level: 'Advanced', color: '#FBBF24', glow: 'rgba(251,191,36,0.3)', benefits: ['Medium loans', 'Reduced rates'] },
  { min: 600, max: 799, level: 'Expert', color: '#8B5CF6', glow: 'rgba(139,92,246,0.3)', benefits: ['Large loans', 'Low rates', 'Priority support'] },
  { min: 800, max: 1000, level: 'Master', color: '#10B981', glow: 'rgba(16,185,129,0.3)', benefits: ['No limits', 'Minimum rates', 'Exclusive access'] }
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
    <div className="w-11 h-6 bg-[#272F42] border border-[#334155] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F59E0B]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]" />
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
      style={{ background: '#0F172A', fontFamily: "'Exo 2', sans-serif", color: '#F8FAFC' }}
    >
      {/* ── Ambient background glows ── */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
      </div>

      {/* ══════════════════════════════════
          HERO SECTION
      ══════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-10 pb-16 border-b max-w-6xl mx-auto" style={{ borderColor: '#334155' }}>

        {/* Network + wallet badges */}
        <div className="hero-element mb-8 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#A78BFA' }}
          >
            <Sparkles size={13} />
            {networkName}
          </span>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm font-mono"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}
          >
            <Wallet size={13} />
            {shortAddress}
          </span>
          {userProfile?.isRegistered ? (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
            >
              <ShieldCheck size={13} /> Verified
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#FBBF24' }}
            >
              <ShieldCheck size={13} /> Pending Registration
            </span>
          )}
        </div>

        {/* Profile card */}
        <div
          className="hero-element flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl relative overflow-hidden"
          style={{ background: 'rgba(39,47,66,0.5)', border: '1px solid #334155', backdropFilter: 'blur(24px)' }}
        >
          {/* Subtle top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #8B5CF6 100%)',
                boxShadow: '0 0 32px rgba(245,158,11,0.25)',
                fontFamily: "'Orbitron', monospace",
                color: '#0F172A'
              }}
            >
              {userProfile?.ensName?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
            </div>
            {/* Online dot */}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{ background: '#10B981', borderColor: '#0F172A' }}
            />
          </div>

          {/* Identity info */}
          <div className="flex-grow text-center md:text-left">
            <h1
              className="text-2xl md:text-3xl font-extrabold mb-1"
              style={{ fontFamily: "'Orbitron', monospace", color: '#F8FAFC' }}
            >
              {userProfile?.ensName || 'No ENS Profile'}
            </h1>
            <p className="text-xs font-mono mb-5" style={{ color: '#64748B' }}>{address}</p>

            {/* Reputation progress */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span style={{ color: currentLevel.color }}>{currentLevel.level}</span>
                <span style={{ color: '#94A3B8' }}>{displayScore} / 1000 pts</span>
              </div>
              <div
                className="h-2.5 w-full rounded-full overflow-hidden relative"
                style={{ background: '#272F42' }}
              >
                <div
                  className="progress-bar h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, #F59E0B, #8B5CF6)`,
                    boxShadow: `0 0 12px rgba(245,158,11,0.5)`
                  }}
                >
                  {/* Shimmer animation */}
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
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
                background: isEditing ? 'rgba(139,92,246,0.15)' : '#8B5CF6',
                color: '#FFFFFF',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 20px rgba(139,92,246,0.25)'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
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
            style={{ background: 'rgba(39,47,66,0.4)', border: '1px solid #334155', backdropFilter: 'blur(16px)' }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
            />

            <div className="flex justify-between items-center mb-8">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Orbitron', monospace", color: '#F8FAFC' }}
              >
                Personal Information
              </h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                    style={{ background: '#8B5CF6', color: '#FFFFFF' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#94A3B8' }}>Primary ENS</label>
                {isEditing ? (
                  <input
                    value={profileData.ensName}
                    onChange={e => setProfileData(prev => ({ ...prev, ensName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono transition-all duration-200 outline-none"
                    placeholder="name.eth"
                    style={{
                      background: '#0F172A',
                      border: '1px solid #334155',
                      color: '#F8FAFC'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm font-mono"
                    style={{ background: '#0F172A', border: '1px solid #272F42', color: '#94A3B8' }}
                  >
                    {userProfile?.ensName || 'Not configured'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#94A3B8' }}>
                  <span className="flex items-center gap-1.5"><Twitter size={12} /> Twitter / X</span>
                </label>
                {isEditing ? (
                  <input
                    value={profileData.socialLinks.twitter}
                    onChange={e => handleChangeSocial('twitter', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    placeholder="https://twitter.com/..."
                    style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}
                    onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#0F172A', border: '1px solid #272F42', color: '#94A3B8' }}
                  >
                    {profileData.socialLinks.twitter || 'Not connected'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#94A3B8' }}>
                  <span className="flex items-center gap-1.5"><Globe size={12} /> Website</span>
                </label>
                {isEditing ? (
                  <input
                    value={profileData.socialLinks.website}
                    onChange={e => handleChangeSocial('website', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    placeholder="https://..."
                    style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}
                    onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#0F172A', border: '1px solid #272F42', color: '#94A3B8' }}
                  >
                    {profileData.socialLinks.website || 'Not configured'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-2" style={{ color: '#94A3B8' }}>Biography</label>
                {isEditing ? (
                  <textarea
                    value={profileData.description}
                    onChange={e => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none resize-none"
                    placeholder="Share your story..."
                    style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }}
                    onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
                  />
                ) : (
                  <div
                    className="px-4 py-3 rounded-xl text-sm min-h-[100px] whitespace-pre-wrap"
                    style={{ background: '#0F172A', border: '1px solid #272F42', color: '#94A3B8' }}
                  >
                    {profileData.description || 'No biography added yet.'}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reputation System Card */}
          <section
            className="stagger-item rounded-3xl p-8 relative overflow-hidden transition-all duration-300"
            style={{ background: 'rgba(39,47,66,0.4)', border: '1px solid #334155', backdropFilter: 'blur(16px)' }}
          >
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }}
            />

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Orbitron', monospace", color: '#F8FAFC' }}
                >
                  Reputation System
                </h2>
                <p className="text-xs leading-relaxed max-w-md" style={{ color: '#64748B' }}>
                  Your score updates with every payment, loan, and community participation on the network.
                </p>
              </div>
              <button
                onClick={handleBumpReputation}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#F59E0B'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
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
                      background: isActive ? `${level.color}18` : 'rgba(15,23,42,0.5)',
                      border: `1px solid ${isActive ? level.color : '#334155'}`,
                      color: isActive ? level.color : '#64748B',
                      boxShadow: isActive ? `0 0 16px ${level.glow}` : 'none'
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
              style={{ background: '#0F172A', border: '1px solid #272F42' }}
            >
              <h4
                className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ color: '#F59E0B', fontFamily: "'Orbitron', monospace" }}
              >
                <Star size={15} />
                Active Benefits — {currentLevel.level}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLevel.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-xs px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(39,47,66,0.6)', border: '1px solid #334155', color: '#CBD5E1' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: currentLevel.color, boxShadow: `0 0 6px ${currentLevel.glow}` }}
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
            style={{ background: 'rgba(39,47,66,0.4)', border: '1px solid #334155', backdropFilter: 'blur(16px)' }}
          >
            <h2
              className="text-sm font-bold mb-5"
              style={{ fontFamily: "'Orbitron', monospace", color: '#F59E0B' }}
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
                    style={{ background: '#0F172A', border: '1px solid #334155' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 0 16px rgba(245,158,11,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: `linear-gradient(135deg, ${stat.color.replace('from-', '').split(' ')[0]}, ${stat.color.replace('to-', '').split(' ').pop()})`.replace(/\[|\]/g, '') }}
                    >
                      <Icon size={15} style={{ color: '#0F172A' }} />
                    </div>
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: '#64748B' }}>{stat.label}</p>
                    <p className="text-lg font-extrabold font-mono" style={{ color: '#F8FAFC' }}>{stat.value}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Preferences */}
          <section
            className="stagger-item rounded-3xl p-6 relative overflow-hidden"
            style={{ background: 'rgba(39,47,66,0.4)', border: '1px solid #334155', backdropFilter: 'blur(16px)' }}
          >
            <h2
              className="text-sm font-bold mb-5"
              style={{ fontFamily: "'Orbitron', monospace", color: '#8B5CF6' }}
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
                    <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{pref.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{pref.desc}</p>
                  </div>
                  <Switch checked={pref.defaultOn} />
                </div>
              ))}
            </div>
          </section>

          {/* Network info */}
          <section
            className="stagger-item rounded-3xl p-6 relative overflow-hidden"
            style={{ background: 'rgba(39,47,66,0.4)', border: '1px solid #334155', backdropFilter: 'blur(16px)' }}
          >
            <h2
              className="text-sm font-bold mb-4"
              style={{ fontFamily: "'Orbitron', monospace", color: '#94A3B8' }}
            >
              Network
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#64748B' }}>Chain</span>
                <span className="font-mono font-bold" style={{ color: '#F59E0B' }}>{networkName}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ background: '#272F42' }}
              />
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#64748B' }}>Address</span>
                <span className="font-mono font-bold" style={{ color: '#A78BFA' }}>{shortAddress}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ background: '#272F42' }}
              />
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#64748B' }}>Level</span>
                <span
                  className="font-bold px-2 py-0.5 rounded-md text-[10px]"
                  style={{
                    background: `${currentLevel.color}18`,
                    color: currentLevel.color,
                    border: `1px solid ${currentLevel.color}40`
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
