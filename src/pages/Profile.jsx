import React, { useState, useMemo, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import { useNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { User, Shield, Star, Settings, Edit3, Save, X, Sparkles, ShieldCheck, Wallet, ChevronRight } from 'lucide-react'
import { useWalletConnection } from '../hooks/useWalletConnection'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useAiAssistantContext } from '../context/AiAssistantContext'
import { ReputationOnchainService } from '../services/ReputationOnchain'

gsap.registerPlugin(ScrollTrigger)

const PROFILE_STATS = [
  { label: 'Transactions', icon: User, value: 45 },
  { label: 'Total Volume', icon: Shield, value: '$1,250' },
  { label: 'Avg Rating', icon: Star, value: '4.8' },
  { label: 'Platform Days', icon: Settings, value: 120 }
]

const REPUTATION_LEVELS = [
  { min: 0, max: 199, level: 'Beginner', hue: 0, benefits: ['Basic payments'] },
  { min: 200, max: 399, level: 'Intermediate', hue: 30, benefits: ['Small microloans', 'Standard rates'] },
  { min: 400, max: 599, level: 'Advanced', hue: 45, benefits: ['Medium loans', 'Reduced rates'] },
  { min: 600, max: 799, level: 'Expert', hue: 210, benefits: ['Large loans', 'Low rates', 'Priority support'] },
  { min: 800, max: 1000, level: 'Master', hue: 140, benefits: ['No limits', 'Minimum rates', 'Exclusive access'] }
]

const Switch = ({ checked = false }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
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
      lenis = new Lenis({
        duration: 1.2,
        smooth: true,
      })

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
    <div ref={pageRef} className="bg-white font-sans text-black w-full min-h-screen pb-20">
      
      {/* Hero Section */}
      <section className="min-h-[40vh] flex flex-col items-center justify-center relative px-6 w-full pt-10 border-b border-gray-100 pb-12 mb-12">
        <div className="text-center max-w-4xl mx-auto w-full">
          <div className="hero-element mb-8 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles size={16} /> {networkName}
            </span>
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Wallet size={16} /> {shortAddress}
            </span>
            {userProfile?.isRegistered ? (
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <ShieldCheck size={16} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <ShieldCheck size={16} /> Pending Registration
              </span>
            )}
          </div>
          
          <div className="hero-element flex flex-col md:flex-row items-center gap-8 bg-gray-50 p-8 rounded-3xl border border-gray-100 text-left">
            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {userProfile?.ensName?.charAt(0) || address?.charAt(2) || 'U'}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-extrabold text-black mb-1">{userProfile?.ensName || 'No ENS Profile'}</h1>
              <p className="text-gray-500 font-mono text-sm mb-4">{address}</p>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-black">Level: {currentLevel.level}</span>
                  <span className="text-gray-500">{(onchainScore ?? reputationScore ?? 0)} / 1000 pts</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="progress-bar h-full bg-black rounded-full" style={{ width: `${Math.min(((onchainScore ?? reputationScore) || 0) / 10, 100)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                <Edit3 size={18} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 animate-section">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Personal Info */}
          <section className="stagger-item bg-white border border-gray-200 rounded-3xl p-8 hover:border-black transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">Personal Information</h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"><Save size={16} /> Save</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"><X size={16} /> Cancel</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Primary ENS</label>
                {isEditing ? (
                  <input value={profileData.ensName} onChange={e => setProfileData(prev => ({...prev, ensName: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none" placeholder="name.eth" />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">{userProfile?.ensName || 'Not configured'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Twitter / X</label>
                {isEditing ? (
                  <input value={profileData.socialLinks.twitter} onChange={e => handleChangeSocial('twitter', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none" placeholder="https://twitter.com/..." />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">{profileData.socialLinks.twitter || 'Not connected'}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-black mb-2">Biography</label>
                {isEditing ? (
                  <textarea value={profileData.description} onChange={e => setProfileData(prev => ({...prev, description: e.target.value}))} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none resize-none" placeholder="Share your story..." />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 min-h-[100px] whitespace-pre-wrap">{profileData.description || 'No biography added yet.'}</div>
                )}
              </div>
            </div>
          </section>

          {/* Reputation System */}
          <section className="stagger-item bg-white border border-gray-200 rounded-3xl p-8 hover:border-black transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">Reputation System</h2>
                <p className="text-gray-500 text-sm max-w-md">Your score updates with every payment, loan, and community participation on the network.</p>
              </div>
              <button onClick={handleBumpReputation} className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                +5 Pts (Demo)
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-black mb-4 flex items-center gap-2"><Star size={18} /> Active Benefits</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLevel.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          
          {/* Stats */}
          <section className="stagger-item bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h2 className="text-lg font-bold text-black mb-6">Personal Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              {PROFILE_STATS.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200">
                    <Icon size={18} className="text-gray-400 mb-3" />
                    <p className="text-xs text-gray-500 font-bold mb-1">{stat.label}</p>
                    <p className="text-xl font-extrabold text-black">{stat.value}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Preferences */}
          <section className="stagger-item bg-white border border-gray-200 rounded-3xl p-8 hover:border-black transition-colors duration-300">
            <h2 className="text-lg font-bold text-black mb-6">Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-sm">Public Profile</p>
                  <p className="text-xs text-gray-500 mt-1">Allow others to view your bio</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-sm">Show Balances</p>
                  <p className="text-xs text-gray-500 mt-1">Display USDC on profile</p>
                </div>
                <Switch checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-sm">Notifications</p>
                  <p className="text-xs text-gray-500 mt-1">Receive payment alerts</p>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  )
}

export default Profile
