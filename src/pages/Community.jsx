import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animate, stagger, random } from 'animejs'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users, MessageCircle, TrendingUp, Award, Heart, Sparkles, ShieldCheck, Wallet, Calendar,
  MapPin, ArrowRight, ChevronDown, Check, Info, Globe, Cpu, Zap, Activity, HelpCircle,
  MessageSquare, UserCheck, Flame, ChevronRight, Share2, Plus, Star
} from 'lucide-react'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { useAiAssistantContext } from '../context/AiAssistantContext'

// ==========================================
// 1. DYNAMIC CANVAS PARTICLE BACKGROUND
// ==========================================
const CinematicBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles = []
    const particleCount = Math.min(60, Math.floor((width * height) / 25000))
    const connectionDistance = 120
    let mouse = { x: null, y: null, radius: 150 }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      })
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Bounce borders
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius
            p.x -= dx * force * 0.02
            p.y -= dy * force * 0.02
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})` // Violet theme
        ctx.fill()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70" />
}

// ==========================================
// 2. INTERACTIVE STAT COUNT-UP COMPONENT
// ==========================================
const CounterItem = ({ label, value, targetNum, suffix = '', icon: Icon, description }) => {
  const [count, setCount] = useState(0)
  const elementRef = useRef(null)

  useEffect(() => {
    let observer
    let animationStarted = false

    const startCounter = () => {
      let start = 0
      const duration = 2000
      const startTime = performance.now()

      const updateCount = (timestamp) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out quadratic
        const easeProgress = progress * (2 - progress)
        const currentCount = Math.floor(easeProgress * targetNum)

        setCount(currentCount)

        if (progress < 1) {
          requestAnimationFrame(updateCount)
        } else {
          setCount(targetNum)
        }
      }

      requestAnimationFrame(updateCount)
    }

    if (elementRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !animationStarted) {
            animationStarted = true
            startCounter()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(elementRef.current)
    }

    return () => {
      if (observer && elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [targetNum])

  return (
    <div ref={elementRef} className="relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col justify-between overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-500 text-sm font-semibold tracking-wider uppercase">{label}</span>
        <div className="p-3 bg-white/5 rounded-2xl text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/10 transition-all duration-300">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 font-mono">
          {count.toLocaleString()}{suffix}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ==========================================
// 3. ACCORDION FAQ ITEM
// ==========================================
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-zinc-800 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-semibold text-zinc-100 hover:text-white transition-colors duration-300">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-zinc-500 p-1 bg-white/5 rounded-full"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-zinc-400 leading-relaxed text-sm">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================
const Community = () => {
  const navigate = useNavigate()
  const { setPageIntent, updatePageContext } = useAiAssistantContext()
  const {
    address, isConnected, userProfile, isLoadingProfile, ensName, reputationScore,
    connectWallet, disconnectWallet, registerMicroPayUser, connectors
  } = useWalletConnection()

  // Onboarding Step State
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [subdomainInput, setSubdomainInput] = useState('')
  const [selectedInterests, setSelectedInterests] = useState([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  // Creator profile preview modal or spotlight state
  const [selectedCreator, setSelectedCreator] = useState(null)

  // AI intent synchronization
  useEffect(() => {
    setPageIntent('community-advice')
    return () => {
      setPageIntent('general')
      updatePageContext({}, { replace: true })
    }
  }, [setPageIntent, updatePageContext])

  useEffect(() => {
    updatePageContext({
      section: 'community-landing',
      isConnected,
      ensName,
      reputationScore
    }, { replace: true })
  }, [isConnected, ensName, reputationScore, updatePageContext])

  // Anime.js loop for floating ambient blurs
  useEffect(() => {
    animate('.anime-glow-blob', {
      translateX: () => random(-40, 40),
      translateY: () => random(-30, 30),
      scale: () => random(0.9, 1.25),
      duration: 8000,
      delay: stagger(300),
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuad'
    })
  }, [])

  // Auto-advance onboarding when wallet connects
  useEffect(() => {
    if (isConnected && onboardingStep === 1) {
      if (userProfile?.isRegistered) {
        setOnboardingStep(4) // Directly to success if already registered
      } else {
        setOnboardingStep(2) // Ask for ENS subdomain
      }
    } else if (!isConnected) {
      setOnboardingStep(1)
    }
  }, [isConnected, userProfile, onboardingStep])

  // Handle registration action
  const handleRegisterENS = async (e) => {
    e.preventDefault()
    if (!subdomainInput.trim()) {
      toast.error('Por favor ingresa un subdominio válido')
      return
    }

    setIsRegistering(true)
    try {
      const fullENS = `${subdomainInput.trim()}.micro.eth`
      // Call standard hook method
      await registerMicroPayUser(fullENS, subdomainInput.trim())
      toast.success(`Subdominio ${fullENS} registrado exitosamente!`)
      setOnboardingStep(3) // Advance to Interest choosing
    } catch (err) {
      console.error(err)
      toast.error('Error registrando el subdominio. Inténtalo de nuevo.')
    } finally {
      setIsRegistering(false)
    }
  }

  // Toggle interests
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const interestsList = [
    { id: 'defi', name: 'DeFi Microloans', icon: Zap },
    { id: 'creators', name: 'Creator Economy', icon: Star },
    { id: 'coops', name: 'Cooperativas locales', icon: Users },
    { id: 'governance', name: 'Gobernanza Web3', icon: ShieldCheck },
    { id: 'royalties', name: 'Royalties automáticos', icon: Award }
  ]

  // Bento Community Cards
  const communityCards = [
    {
      span: 'md:col-span-2 col-span-1',
      eyebrow: 'Creators & Music',
      title: 'CulturaChain Collective',
      desc: 'Sincroniza regalías on-chain y recibe financiación directa de tus oyentes con gas subsidiado y soporte ENS.',
      badge: 'Arbitrum Stylus',
      members: '340 miembros',
      score: '+180 pts promedio',
      color: 'from-violet-500/20 to-purple-500/10'
    },
    {
      span: 'col-span-1',
      eyebrow: 'Local Trade',
      title: 'Cooperativa Milpa Alta',
      desc: 'Agricultores locales financiando insumos mediante fondos de préstamos P2P a tasa fija.',
      badge: 'Scroll L2',
      members: '128 miembros',
      score: '98% pago a tiempo',
      color: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      span: 'col-span-1',
      eyebrow: 'Decentralized Identity',
      title: 'ENS Reputation Layer',
      desc: 'El primer registro de crédito comunitario basado exclusivamente en reputación ENS on-chain y liquidación instantánea.',
      badge: 'ENS Verify',
      members: '1,247 perfiles',
      score: 'Zero collateral',
      color: 'from-blue-500/20 to-indigo-500/10'
    },
    {
      span: 'md:col-span-2 col-span-1',
      eyebrow: 'Micropayments',
      title: 'Cooperativa de Gas Sin Fricción',
      desc: 'Ahorro masivo en fees de red para cooperativas de servicios. Liquidaciones en USDC con contratos inteligentes inteligentes.',
      badge: 'Arbitrum Gas Subsidy',
      members: '84 cooperativas',
      score: '0.0001 USD/Tx',
      color: 'from-pink-500/20 to-rose-500/10'
    }
  ]

  // Trending discussions
  const trendingDiscussions = [
    {
      id: 'd-1',
      title: 'Optimización de comisiones en Scroll utilizando bundles comunitarios',
      author: 'sofia.micro.eth',
      reputation: 920,
      likes: 42,
      replies: 18,
      category: 'Optimización',
      time: 'Hace 3 horas'
    },
    {
      id: 'd-2',
      title: 'Propuesta: Expandir pools de microcréditos para artesanos de Oaxaca',
      author: 'marcos.micro.eth',
      reputation: 780,
      likes: 56,
      replies: 24,
      category: 'Gobernanza',
      time: 'Hace 5 horas'
    },
    {
      id: 'd-3',
      title: '¿Cómo integrar el Trust Score en contratos inteligentes Stylus escritos en Rust?',
      author: 'lucas.micro.eth',
      reputation: 890,
      likes: 29,
      replies: 12,
      category: 'Desarrollo',
      time: 'Hace 8 horas'
    }
  ]

  // Featured Creators
  const creators = [
    {
      name: 'Daniela Garza',
      ens: 'daniela.micro.eth',
      role: 'Productora Musical',
      score: 950,
      volume: '14,200 USDC',
      avatarColor: 'from-purple-500 to-indigo-500',
      bio: 'Pionera en el uso de CulturaChain para la distribución de regalías on-chain y micro-financiación colectiva.',
      skills: ['Audio NFT', 'Royalties', 'Scroll L2']
    },
    {
      name: 'Mateo Ortiz',
      ens: 'mateo.micro.eth',
      role: 'Desarrollador Smart Contracts',
      score: 910,
      volume: '8,900 USDC',
      avatarColor: 'from-blue-500 to-cyan-500',
      bio: 'Creador de los primeros templates de préstamos P2P en Rust para Arbitrum Stylus en CredLayer.',
      skills: ['Rust', 'Stylus', 'ENS integrations']
    },
    {
      name: 'Elena Fuentes',
      ens: 'elena.micro.eth',
      role: 'Líder Cooperativa Agraria',
      score: 890,
      volume: '23,500 USDC',
      avatarColor: 'from-emerald-500 to-teal-500',
      bio: 'Coordinadora de cooperativas agrícolas, impulsando el acceso a microcréditos de tasa cero para pequeños agricultores.',
      skills: ['Microcréditos', 'Scroll', 'P2P Pooling']
    }
  ]

  // Testimonials
  const testimonials = [
    {
      quote: "CredLayer AI transformó nuestra cooperativa en Oaxaca. Logramos asegurar microcréditos de fondeadores globales sin avales tradicionales, solo con la confianza on-chain de nuestra comunidad.",
      author: "Elena Fuentes",
      role: "Líder de Cooperativa Agrícola",
      ens: "elena.micro.eth"
    },
    {
      quote: "Como músico independiente, las comisiones de gas solían devorar mis ingresos de NFT musicales. Gracias al gas subsidiado de CulturaChain y CredLayer, ahora recibo el 99% de mis ganancias directamente en segundos.",
      author: "Daniela Garza",
      role: "Productora & Cantautora",
      ens: "daniela.micro.eth"
    },
    {
      quote: "El sistema de reputación integrada ENS es genial. No necesitas KYC intrusivo. Tu comportamiento de pago sobre Scroll habla por ti, abriéndote puertas a capital de bajo interés al instante.",
      author: "Julio Ríos",
      role: "Fundador de Startup Local",
      ens: "julio.micro.eth"
    }
  ]

  // FAQ Array
  const faqs = [
    {
      q: "¿Cómo funciona el sistema de reputación ENS?",
      a: "Asociamos tu billetera a un subdominio (.micro.eth). Cada vez que realizas un pago a tiempo o participas como fondeador comunitario en CredLayer, tu puntuación aumenta. Una reputación sólida reduce las tasas de interés de tus microcréditos futuros y te otorga mayor peso de voto en la gobernanza."
    },
    {
      q: "¿Cuáles son las redes y L2 soportadas?",
      a: "Actualmente operamos sobre Arbitrum One (aprovechando Arbitrum Stylus para contratos de bajo costo en Rust) y Scroll L2 (para pruebas de conocimiento cero y máxima escalabilidad compatible con EVM). Gas subsidiado está disponible para cooperativas registradas."
    },
    {
      q: "¿Es necesario depositar garantías físicas para un crédito?",
      a: "No. El modelo de CredLayer AI es 'Zero-Collateral' (sin garantías físicas). Los créditos se otorgan basados en el Trust Score y en el aval social de los miembros de tu colectivo o comunidad que decidan co-firmar o aportar al pool de crédito."
    },
    {
      q: "¿Cómo puedo integrar a mi comunidad o cooperativa?",
      a: "El proceso es simple: conecta tu billetera, registra un subdominio para tu cooperativa y crea un pool comunitario en la sección de Préstamos. A partir de ahí, puedes invitar a tus miembros y empezar a calificar reputación conjunta."
    }
  ]

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">

      {/* ── BACKGROUND LIGHTING AND SHADOW DEPT ── */}
      <CinematicBackground />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none z-0 anime-glow-blob" />
      <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/5 blur-[160px] pointer-events-none z-0 anime-glow-blob" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 blur-[140px] pointer-events-none z-0 anime-glow-blob" />

      {/* ==========================================
          NAVBAR: FLOATING GLASSMORPHIC
         ========================================== */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl h-16 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-full z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-300">
        <a href="/landing/index.html" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="text-indigo-400" size={20} />
          <span className="font-extrabold tracking-tight text-white text-lg font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">CredLayer Community</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-zinc-400 text-sm font-medium">
          <a href="/landing/index.html" className="hover:text-white transition-colors">Home</a>
          <a href="/payments" className="hover:text-white transition-colors">Payments</a>
          <a href="/loans" className="hover:text-white transition-colors">Loans</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#discussions" className="hover:text-white transition-colors">Trending</a>
          <a href="#onboarding" className="hover:text-white transition-colors">Join Us</a>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-bold text-xs shadow-md shadow-white/5 transition-all duration-300 hover:scale-105"
            >
              <UserCheck size={14} />
              <span>{userProfile?.ensName || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}</span>
              <span className="bg-zinc-900 text-white px-2 py-0.5 rounded-full text-[10px]">{reputationScore || 100} PTS</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (connectors.length > 0) {
                  setIsWalletModalOpen(true)
                } else {
                  toast.error('No se encontraron conectores de billetera.')
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 rounded-full font-bold text-xs transition-all duration-300 hover:scale-105"
            >
              <Wallet size={14} />
              <span>Conectar Wallet</span>
            </button>
          )}
        </div>
      </nav>

      {/* ==========================================
          HERO SECTION: STAGGERED REVEALS & GLOWS
         ========================================== */}
      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center text-center z-10 min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md mb-8 hover:border-indigo-500/20 transition-all duration-300"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-slow" />
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest font-mono">Arbitrum • Scroll • ENS Identity</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-8 max-w-5xl leading-[1.08] bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400"
        >
          The AI-Native Layer for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Community Economies</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-zinc-400 text-lg md:text-xl max-w-3xl leading-relaxed mb-12"
        >
          Empowering local networks, creators, and decentralized microfinance through reputation-backed ENS identities on Scroll L2 and Arbitrum Stylus. Zero collateral, complete community trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <a
            href="#onboarding"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-zinc-950 font-bold rounded-full transition-all duration-300 hover:bg-zinc-200 hover:scale-105 shadow-xl shadow-white/5"
          >
            <span>Crear Identidad Comunitaria</span>
            <ArrowRight size={16} />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border border-white/5 hover:border-white/10 font-bold rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
          >
            Explorar Bento Grid
          </a>
        </motion.div>

        {/* Cinematic Dashboard Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          className="w-full mt-24 relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-4 shadow-[0_0_80px_rgba(99,102,241,0.05)] group hover:border-white/10 transition-all duration-500"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 px-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            </div>
            <div className="px-4 py-1 bg-white/5 rounded-full text-[10px] text-zinc-500 font-mono tracking-wider flex items-center gap-1.5">
              <Activity size={10} className="text-emerald-400 animate-pulse" />
              <span>credlayer-nodes-active (arbitrum-stylus)</span>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-zinc-950/80 flex flex-col md:flex-row items-stretch border border-white/5">
            <div className="w-full md:w-[35%] p-6 border-r border-white/5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider block mb-2">Social Hub</span>
                <h4 className="text-lg font-bold text-white mb-2">Comunidades Conectadas</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">Cada miembro registrado con ENS hereda una línea de confianza comunitaria respaldada por contratos inteligentes.</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">POOL DE CRÉDITO ACTIVO</span>
                </div>
                <span className="text-lg font-mono font-bold text-white">$142,500 USDC</span>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between text-left bg-zinc-900/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">NOVA ENGINE</span>
                  <div className="text-xs text-zinc-500 mt-1">Análisis predictivo de reputación comunitaria</div>
                </div>
                <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold">
                  AI-Powered L3
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 my-auto">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Total Stake</div>
                  <div className="text-base font-bold text-white font-mono">420,500 USDC</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Reputation index</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">98.4% A+</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Active nodes</div>
                  <div className="text-base font-bold text-white font-mono">824 nodes</div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Último bloque validado: #18420950</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> 0.3s block time</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          BENTO GRID: FEATURED COMMUNITIES
         ========================================== */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto z-10 relative">
        <div className="text-center md:text-left mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Ecosistema Colaborativo</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Bento Grid: Comunidades Pioneras
            </h2>
          </div>
          <p className="text-zinc-400 text-sm md:text-base max-w-md">
            Módulos interactivos que representan cooperativas reales, colectivos creativos y sistemas de reputación integrados en CredLayer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className={`relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30 backdrop-blur-2xl p-8 flex flex-col justify-between group hover:border-white/15 transition-all duration-300 ${card.span}`}
            >
              {/* Internal glow backdrop gradient */}
              <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${card.color} rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500`} />

              <div>
                <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest block mb-4">
                  {card.eyebrow}
                </span>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-medium bg-white/5 px-3 py-1 rounded-full">
                    {card.badge}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {card.members}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {card.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
          STATS SECTION: INTERACTIVE COUNT-UP
         ========================================== */}
      <section className="py-20 px-6 max-w-6xl mx-auto z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CounterItem
            label="MIEMBROS ACTIVOS"
            targetNum={24850}
            suffix="+"
            icon={Users}
            description="Usuarios con reputación ENS activa en nuestra red."
          />
          <CounterItem
            label="PRÉSTAMOS FONDEADOS"
            targetNum={1420900}
            suffix=" USDC"
            icon={TrendingUp}
            description="Volumen acumulado en microcréditos descentralizados."
          />
          <CounterItem
            label="NODOS DE REPUTACIÓN"
            targetNum={8240}
            suffix="+"
            icon={Cpu}
            description="Validadores independientes en Arbitrum L2 y Scroll."
          />
          <CounterItem
            label="GAS SUBSIDIADO"
            targetNum={95}
            suffix="%"
            icon={Zap}
            description="Porcentaje de ahorro promedio en transacciones comunitarias."
          />
        </div>
      </section>

      {/* ==========================================
          TRENDING DISCUSSIONS
         ========================================== */}
      <section id="discussions" className="py-24 px-6 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Conversación On-Chain</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Discusiones en Tendencia
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Últimas propuestas y preguntas técnicas planteadas por la comunidad. Sincronizadas y votadas en la red.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingDiscussions.map((disc, idx) => (
            <motion.article
              key={disc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
              className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300 hover:scale-[1.02] group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    {disc.category}
                  </span>
                  <span className="text-xs text-zinc-500">{disc.time}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-indigo-200 transition-colors">
                  "{disc.title}"
                </h4>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white font-mono">
                    {disc.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block">{disc.author}</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">Rep: {disc.reputation} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-xs font-mono">
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Heart size={12} className="text-pink-500" />
                    <span>{disc.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MessageSquare size={12} className="text-indigo-400" />
                    <span>{disc.replies}</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => toast.success('Próximamente: Foro comunitario on-chain en desarrollo.')}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors duration-300 group"
          >
            <span>Ver todas las discusiones</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ==========================================
          CREATOR SPOTLIGHT
         ========================================== */}
      <section className="py-24 px-6 max-w-6xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          <div className="max-w-xl text-left">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Líderes de Ecosistema</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Creadores Destacados
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Conoce a los líderes comunitarios con los puntajes de reputación más altos. Su participación activa impulsa la economía del protocolo.
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-3">
            <button
              onClick={() => toast.success('Próximamente: Directorio completo de creadores ENS.')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-full text-xs font-bold border border-white/5 transition-colors"
            >
              Ver Directorio Completo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((creator, i) => (
            <motion.div
              key={i}
              onClick={() => setSelectedCreator(creator)}
              whileHover={{ y: -6 }}
              className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 hover:border-indigo-500/20 rounded-3xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${creator.avatarColor} flex items-center justify-center font-bold text-white shadow-lg shadow-black/30 font-mono`}>
                    {creator.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">{creator.name}</h4>
                    <span className="text-xs text-zinc-500 font-mono">{creator.ens}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-4 mb-4">
                  <span className="text-zinc-500">Rol</span>
                  <span className="text-zinc-300 font-medium">{creator.role}</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed mb-6 line-clamp-2">
                  {creator.bio}
                </p>
              </div>

              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3 mt-auto">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono">Vol. Liquidado</span>
                  <span className="text-xs font-mono font-bold text-white">{creator.volume}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono">Reputación</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{creator.score} PTS</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
          ONBOARDING: JOIN THE PLATFORM (FLOW)
         ========================================== */}
      <section id="onboarding" className="py-24 px-6 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Paso a Paso</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Únete a la Economía CredLayer
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-4">
            Reclama tu identidad digital y obtén tu primer paquete de reputación ENS con gas totalmente subsidiado.
          </p>
        </div>

        {/* Dynamic Onboarding Card */}
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-indigo-500/2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Steps Indicator */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-10 border-b border-zinc-800 pb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 font-mono ${onboardingStep === step
                  ? 'bg-white text-zinc-950 shadow-md scale-110'
                  : onboardingStep > step
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-zinc-800 text-zinc-500'
                  }`}>
                  {onboardingStep > step ? <Check size={12} /> : step}
                </div>
                {step < 4 && <div className={`w-6 md:w-12 h-0.5 ${onboardingStep > step ? 'bg-indigo-500/30' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>

          {/* Step Contents */}
          <AnimatePresence mode="wait">

            {/* Step 1: Wallet Connection */}
            {onboardingStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-6">
                  <Wallet size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conecta tu Billetera Web3</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  Para iniciar tu registro de reputación on-chain necesitamos asociar tu dirección en Arbitrum o Scroll.
                </p>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-8 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-bold text-sm transition-all duration-300 shadow-md shadow-white/5 hover:scale-105"
                >
                  Conectar Wallet
                </button>
              </motion.div>
            )}

            {/* Step 2: ENS Subdomain Creation */}
            {onboardingStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 mx-auto mb-6">
                  <Award size={28} />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Reclama tu Identidad ENS</h3>
                <p className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">
                  Crea tu subdominio gratuito de reputación comunitaria para CredLayer.
                </p>
                <form onSubmit={handleRegisterENS} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="tunombre"
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none transition-colors"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                      .micro.eth
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs px-1">
                    <Info size={12} className="text-indigo-400 flex-shrink-0" />
                    <span>Tu subdominio calcula y almacena tu puntuación de pago en L2.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isRegistering ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Confirmar Registro</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Interest Selection */}
            {onboardingStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Selecciona tus Intereses</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                  Personalizaremos tu dashboard de préstamos y propuestas on-chain.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {interestsList.map((interest) => {
                    const IconComp = interest.icon
                    const isSelected = selectedInterests.includes(interest.id)
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${isSelected
                          ? 'bg-white text-zinc-950 border-white font-bold'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                          }`}
                      >
                        <IconComp size={12} />
                        <span>{interest.name}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="w-full py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Step 4: Onboarding Completed / Profile Card */}
            {onboardingStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto text-center"
              >
                <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">¡Registro Completado!</h3>
                <p className="text-zinc-500 text-xs font-mono mb-6">{ensName || subdomainInput ? `${ensName || subdomainInput}.micro.eth` : 'Tu Identidad Web3'}</p>

                {/* Simulated Identity Card Badge */}
                <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-left mb-8 overflow-hidden shadow-inner shadow-zinc-900">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">CREDENTIAL CARD</span>
                      <h4 className="text-sm font-bold text-white font-mono">{ensName || `${subdomainInput || 'usuario'}.micro.eth`}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      VERIFICADO
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mb-4 font-mono font-bold">
                    {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '0x00000...000000'}
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                    <div>
                      <span className="text-[9px] text-zinc-500 font-mono block">REPUTACIÓN INICIAL</span>
                      <span className="text-sm font-bold text-white font-mono">{reputationScore || 100} PTS</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 font-mono block">RED DE REGISTRO</span>
                      <span className="text-xs font-bold text-zinc-400 font-mono">SCROLL L2</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      toast.success('Abriendo dashboard con tu nuevo perfil!')
                      navigate('/dashboard')
                    }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    Ir al Dashboard
                  </button>
                  <button
                    onClick={() => {
                      disconnectWallet()
                      setOnboardingStep(1)
                      setSubdomainInput('')
                      setSelectedInterests([])
                    }}
                    className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIALS SECTION
         ========================================== */}
      <section className="py-24 px-6 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Testimonios</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Qué Dicen las Comunidades
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-zinc-900/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col justify-between"
            >
              <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">
                  {test.author.slice(0, 1)}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{test.author}</h5>
                  <span className="text-[10px] text-zinc-500 block">{test.role} • {test.ens}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
          FAQ SECTION: ACCORDIONS
         ========================================== */}
      <section className="py-24 px-6 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-3">Preguntas Frecuentes</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Resuelve tus Dudas
          </h2>
          <p className="text-zinc-400 text-sm">
            Toda la información técnica y de funcionamiento sobre el ecosistema descentralizado de CredLayer.
          </p>
        </div>

        <div className="bg-zinc-900/20 backdrop-blur-2xl border border-white/5 rounded-[32px] px-8 py-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ==========================================
          FOOTER WITH MODERN LAYOUT
         ========================================== */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md pt-20 pb-10 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">

          <div className="md:col-span-1">
            <a href="/landing/index.html" className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
              <Sparkles className="text-indigo-400" size={20} />
              <span className="font-extrabold tracking-tight text-white text-lg font-sans">CredLayer AI</span>
            </a>
            <p className="text-zinc-500 text-xs leading-relaxed mb-6">
              Financiación colectiva y pagos eficientes sobre redes L2 con gas subsidiado para comunidades de desarrollo en LATAM.
            </p>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono">All systems operational</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Producto</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/payments" className="hover:text-white transition-colors">Sistema de Pagos</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Préstamos P2P</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Panel Unificado</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Rust Stylus SDK</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Recursos</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentación de L2</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guía ENS Subdominios</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Auditorías de Código</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Whitepaper</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Únete al Boletín</h5>
            <p className="text-zinc-500 text-xs leading-relaxed mb-4">
              Recibe las últimas propuestas de pools de crédito y actualizaciones técnicas.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@dominio.com"
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 w-full"
              />
              <button
                onClick={() => toast.success('Suscripción exitosa.')}
                className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
              >
                Unirme
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 font-mono">
          <span>© {new Date().getFullYear()} CredLayer AI. Todos los derechos reservados.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-zinc-400">Terminos de Servicio</a>
            <a href="#" className="hover:text-zinc-400">Privacidad</a>
            <a href="#" className="hover:text-zinc-400">Contacto</a>
          </div>
        </div>
      </footer>

      {/* ==========================================
          WALLET SELECTION MODAL
         ========================================== */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-white">Selecciona tu Proveedor</h4>
                <button
                  onClick={() => setIsWalletModalOpen(false)}
                  className="p-1 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {connectors.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => {
                      connectWallet(conn.id)
                      setIsWalletModalOpen(false)
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-950 hover:bg-zinc-800/80 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <span className="font-semibold text-sm text-zinc-200 group-hover:text-white">{conn.name}</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          CREATOR PROFILE PREVIEW MODAL
         ========================================== */}
      <AnimatePresence>
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCreator(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl z-10 text-left"
            >
              <button
                onClick={() => setSelectedCreator(null)}
                className="absolute top-6 right-6 p-1 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedCreator.avatarColor} flex items-center justify-center font-bold text-white text-lg font-mono`}>
                  {selectedCreator.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedCreator.name}</h4>
                  <span className="text-xs text-indigo-400 font-mono">{selectedCreator.ens}</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">Biografía</span>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-white/5">
                  {selectedCreator.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Rol principal</span>
                  <span className="text-xs font-bold text-white">{selectedCreator.role}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Volumen liquidado</span>
                  <span className="text-xs font-bold text-white font-mono">{selectedCreator.volume}</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">Habilidades / Categorías</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCreator.skills.map((skill, index) => (
                    <span key={index} className="text-[10px] text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <span className="text-xs font-semibold text-emerald-400">Puntaje de Reputación</span>
                <span className="text-sm font-mono font-bold text-emerald-300">{selectedCreator.score} PTS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Community
