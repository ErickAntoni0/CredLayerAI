import React, { useState, useMemo, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import { useNetwork } from 'wagmi'
import { toast } from 'react-hot-toast'
import { Users, MessageCircle, TrendingUp, Award, Heart, Sparkles, ShieldCheck, Wallet, Calendar, MapPin, ArrowRightCircle, ArrowRight } from 'lucide-react'
import { useWalletConnection } from '../../hooks/useWalletConnection'
import MembershipFloatingIcons from '../../components/archive/MembershipFloatingIcons'
import useCursorGlow from '../../hooks/useCursorGlow'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAiAssistantContext } from '../../context/AiAssistantContext'

gsap.registerPlugin(ScrollTrigger)

const Community = () => {
  const { userProfile, address, reputationScore } = useWalletConnection()
  const { chain } = useNetwork()
  const { setPageIntent, updatePageContext } = useAiAssistantContext()

  const [activeTab, setActiveTab] = useState('feed')
  const [postContent, setPostContent] = useState('')

  const surfaceRef = useCursorGlow()
  const heroRef = useRef(null)
  const heroStatsRef = useRef(null)
  const tabMenuRef = useRef(null)
  const tabContentRef = useRef(null)
  const feedItemsRef = useRef([])
  const leaderItemsRef = useRef([])
  const eventCardsRef = useRef([])
  const supportCardsRef = useRef([])
  const insightSectionRef = useRef(null)

  const networkName = chain?.name || 'Red no detectada'
  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet conectada'),
    [address]
  )

  const tabs = useMemo(
    () => [
      { id: 'feed', name: 'Feed', icon: '🗞️' },
    { id: 'leaders', name: 'Líderes', icon: '🏆' },
    { id: 'events', name: 'Eventos', icon: '📅' },
    { id: 'support', name: 'Soporte', icon: '💬' }
    ],
    []
  )

  const communityPosts = useMemo(
    () => [
    {
        id: 'feed-1',
      ensName: 'juan.micro.eth',
      content: '¡Acabo de completar mi primer préstamo! El sistema de reputación funciona perfectamente.',
      likes: 12,
      comments: 3,
        timestamp: 'Hace 2 horas',
      type: 'achievement'
    },
    {
        id: 'feed-2',
      ensName: 'maria.micro.eth',
        content: '¿Cómo optimizan las tarifas en Arbitrum cuando la red está congestionada? ¡Compartan tips!',
      likes: 8,
      comments: 7,
        timestamp: 'Hace 4 horas',
      type: 'question'
    },
    {
        id: 'feed-3',
      ensName: 'carlos.micro.eth',
        content: 'CulturaChain MX me ayudó a monetizar mi catálogo musical. Automatizamos royalties en una semana.',
      likes: 25,
      comments: 15,
        timestamp: 'Hace 6 horas',
      type: 'experience'
    }
    ],
    []
  )

  const leaders = useMemo(
    () => [
    { rank: 1, ensName: 'ana.micro.eth', reputation: 950, transactions: 127, category: 'MicroPay' },
    { rank: 2, ensName: 'luis.micro.eth', reputation: 920, transactions: 98, category: 'CulturaChain' },
    { rank: 3, ensName: 'sofia.micro.eth', reputation: 890, transactions: 156, category: 'MicroPay' },
    { rank: 4, ensName: 'miguel.micro.eth', reputation: 870, transactions: 89, category: 'CulturaChain' },
    { rank: 5, ensName: 'carmen.micro.eth', reputation: 850, transactions: 134, category: 'MicroPay' }
    ],
    []
  )

  const events = useMemo(
    () => [
    {
        id: 'event-1',
      title: 'Workshop: Introducción a DeFi',
        date: '2024-11-25T18:00:00Z',
      attendees: 45,
        type: 'Workshop',
        location: 'CDMX'
    },
    {
        id: 'event-2',
      title: 'Meetup: Creadores en CulturaChain',
        date: '2024-11-28T19:30:00Z',
      attendees: 23,
        type: 'Meetup',
        location: 'Guadalajara'
    },
    {
        id: 'event-3',
      title: 'Hackathon: Ethereum México 2025',
        date: '2025-02-15T09:00:00Z',
      attendees: 150,
        type: 'Hackathon',
        location: 'Monterrey'
      }
    ],
    []
  )

  useEffect(() => {
    setPageIntent('community-advice')
    return () => {
      setPageIntent('general')
      updatePageContext({}, { replace: true })
    }
  }, [setPageIntent, updatePageContext])

  useEffect(() => {
    updatePageContext(
      {
        section: 'community',
        network: networkName,
        activeTab,
        reputationScore,
        userRegistered: userProfile?.isRegistered,
        leaders: leaders.slice(0, 3),
        events: events.slice(0, 2)
      },
      { replace: true }
    )
  }, [networkName, activeTab, reputationScore, userProfile, leaders, events, updatePageContext])

  const stats = useMemo(
    () => [
      { label: 'Miembros activos', value: '1,247', icon: Users, accent: 'rgba(59, 130, 246, 0.85)' },
      { label: 'Posts hoy', value: '23', icon: MessageCircle, accent: 'rgba(16, 185, 129, 0.85)' },
      { label: 'Crecimiento mensual', value: '+15%', icon: TrendingUp, accent: 'rgba(245, 158, 11, 0.85)' },
      { label: 'Eventos activos', value: '6', icon: Award, accent: 'rgba(168, 85, 247, 0.85)' }
    ],
    []
  )

  const feedKey = useMemo(() => communityPosts.map(post => post.id).join('|'), [communityPosts])
  const leaderKey = useMemo(() => leaders.map(leader => leader.rank).join('|'), [leaders])
  const eventsKey = useMemo(() => events.map(event => event.id).join('|'), [events])

  const handlePublish = useCallback(() => {
    if (!postContent.trim()) {
      toast.error('Escribe algo para compartir con la comunidad')
      return
    }

    toast.success('Post publicado (modo demo). Lo verás en el feed cuando conectemos el backend.')
    setPostContent('')
  }, [postContent])

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch (error) {
      return dateString
    }
  }, [])

  feedItemsRef.current = []
  leaderItemsRef.current = []
  eventCardsRef.current = []
  supportCardsRef.current = []

  useLayoutEffect(() => {
    if (!surfaceRef.current) return undefined

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })

      tl.from(heroRef.current, { y: 60, opacity: 0 })
        .from(heroStatsRef.current, { y: 70, opacity: 0, duration: 1.1 }, '-=0.6')
        .from(tabMenuRef.current, { y: 30, opacity: 0, duration: 0.6 }, '-=0.4')

      if (heroStatsRef.current) {
        ScrollTrigger.create({
          trigger: heroStatsRef.current,
          start: 'top bottom',
          end: '+=480',
          scrub: true,
          animation: gsap.to(heroStatsRef.current, {
            backgroundPosition: '115% 55%',
            ease: 'none'
          })
        })
      }

      if (insightSectionRef.current) {
        ScrollTrigger.create({
          trigger: insightSectionRef.current,
          start: 'top 85%',
          end: '+=320',
          scrub: true,
          animation: gsap.fromTo(
            insightSectionRef.current,
            { y: 60, opacity: 0.4 },
            { y: 0, opacity: 1, ease: 'power2.out' }
          )
        })
      }
    }, surfaceRef)

    return () => ctx.revert()
  }, [surfaceRef])

  useLayoutEffect(() => {
    if (!tabContentRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )

      if (activeTab === 'feed' && feedItemsRef.current.length) {
        gsap.from(feedItemsRef.current, {
          y: 34,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12
        })
      }

      if (activeTab === 'leaders' && leaderItemsRef.current.length) {
        gsap.from(leaderItemsRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1
        })
      }

      if (activeTab === 'events' && eventCardsRef.current.length) {
        gsap.from(eventCardsRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12
        })
      }

      if (activeTab === 'support' && supportCardsRef.current.length) {
        gsap.from(supportCardsRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1
        })
      }
    }, tabContentRef)

    return () => ctx.revert()
  }, [activeTab, feedKey, leaderKey, eventsKey])

  return (
    <div ref={surfaceRef} className="membership-page interactive-surface">
      <MembershipFloatingIcons position="hero" />

      <section className="membership-hero" ref={heroRef}>
        <div className="membership-hero__grid">
          <div>
            <div className="membership-hero__badge" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="status-chip status-chip--ghost">
                <Sparkles size={16} />
                {networkName}
              </span>
              <span className="status-chip">
                <Wallet size={16} />
                {shortAddress}
              </span>
              {userProfile?.isRegistered ? (
                <span className="status-chip">
                  <ShieldCheck size={16} />
                  Perfil verificado
                  <span className="status-chip__pill">{reputationScore ?? 0} pts</span>
                </span>
              ) : (
                <span className="status-chip status-chip--warning">
                  <ShieldCheck size={16} />
                  Completa tu registro
                </span>
              )}
            </div>
            <h1 className="membership-hero__title">Comunidad MicroPay MX</h1>
            <p className="membership-hero__description">
              Comparte aprendizajes, conecta con cooperativas y recibe apoyo de otros creadores que usan MicroPay MX y CulturaChain MX.
            </p>
            <div className="membership-hero__actions">
              <button className="membership-hero__cta" onClick={() => setActiveTab('feed')}>
                <ArrowRightCircle size={18} />
                Publicar actualización
              </button>
              <button className="membership-hero__cta membership-hero__cta--ghost" onClick={() => setActiveTab('events')}>
                <ArrowRight size={18} />
                Ver eventos próximos
              </button>
            </div>
          </div>

          <div
            className="membership-gradient-card bond-panel--glow"
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            ref={heroStatsRef}
          >
            <h3 className="membership-section-title" style={{ marginBottom: 0 }}>Indicadores comunitarios</h3>
            <div className="membership-stat-section">
              {stats.map(stat => (
                <div key={stat.label} className="membership-stat-card">
                  <div className="membership-stat-value">{stat.value}</div>
                  <div className="membership-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="membership-section-subtitle" style={{ marginBottom: 0 }}>
              Datos agregados de actividad en MicroPay MX y CulturaChain sincronizados cada 5 minutos.
        </p>
      </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="bond-chip-group"
            style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}
            ref={tabMenuRef}
          >
            {tabs.map(tab => (
          <button
            key={tab.id}
                type="button"
            onClick={() => setActiveTab(tab.id)}
                className={`bond-chip ${activeTab === tab.id ? 'active' : ''}`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(120deg, rgba(14,245,195,0.9), rgba(179,255,0,0.95))',
                  color: '#071120',
                  fontWeight: 600,
                  borderColor: 'rgba(179,255,0,0.55)'
                } : {}}
          >
                <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
            <div ref={el => { tabContentRef.current = el }} style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="membership-section-card" style={{ background: 'rgba(15,23,42,0.55)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="membership-avatar" style={{ width: 56, height: 56, fontSize: '1.1rem' }}>
                    {userProfile?.ensName?.charAt(0) || address?.charAt(2) || 'U'}
              </div>
              <div>
                    <h3 className="membership-section-title" style={{ marginBottom: '0.35rem' }}>
                      Comparte con la comunidad
                </h3>
                    <p className="membership-section-subtitle" style={{ marginBottom: 0 }}>
                      Participa en la conversación y gana reputación colaborando con otros usuarios.
                </p>
              </div>
            </div>
            <textarea
                  value={postContent}
                  onChange={event => setPostContent(event.target.value)}
              placeholder="Comparte tu experiencia, pregunta o logro..."
                  className="membership-input"
                  rows={4}
            />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="bond-chip-group" style={{ gap: '0.5rem' }}>
                    <span className="status-chip status-chip--ghost" style={{ cursor: 'pointer' }}>📸 Foto</span>
                    <span className="status-chip status-chip--ghost" style={{ cursor: 'pointer' }}>🎧 Audio</span>
                    <span className="status-chip status-chip--ghost" style={{ cursor: 'pointer' }}>🎉 Logro</span>
              </div>
                  <button type="button" className="membership-hero__cta" onClick={handlePublish}>
                    Publicar ahora
              </button>
            </div>
          </div>

              <div className="membership-list" style={{ gap: '1rem' }}>
                {communityPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="membership-list-item"
                    style={{ alignItems: 'flex-start', gap: '1rem' }}
                    ref={el => (feedItemsRef.current[index] = el)}
                  >
                  <div className="membership-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                    {post.ensName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--white-color)' }}>{post.ensName}</strong>
                      <span className="status-chip status-chip--ghost" style={{ textTransform: 'capitalize' }}>
                        {post.type === 'achievement' ? 'Logro' : post.type === 'question' ? 'Pregunta' : 'Experiencia'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(226,232,240,0.55)' }}>{post.timestamp}</span>
                    </div>
                    <p style={{ color: 'rgba(226,232,240,0.8)' }}>{post.content}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(226,232,240,0.7)', fontSize: '0.85rem' }}>
                      <button className="link-reset" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Heart size={16} /> {post.likes}
                      </button>
                      <button className="link-reset" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MessageCircle size={16} /> {post.comments}
                      </button>
                      <button className="link-reset">Compartir</button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaders' && (
            <div
              className="membership-section-card"
              style={{ background: 'rgba(15,23,42,0.55)' }}
              ref={el => {
                tabContentRef.current = el
              }}
            >
              <h2 className="membership-section-title">Tabla de líderes</h2>
              <p className="membership-section-subtitle">
                Usuarios con mayor reputación combinada entre MicroPay MX y CulturaChain MX.
              </p>
              <div className="membership-list" style={{ gap: '0.85rem' }}>
                {leaders.map((leader, index) => (
                  <div
                    key={leader.rank}
                    className="membership-list-item"
                    style={{ justifyContent: 'space-between', alignItems: 'center' }}
                    ref={el => (leaderItemsRef.current[index] = el)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '999px',
                        background: leader.rank === 1 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : leader.rank === 2 ? 'linear-gradient(135deg, #cbd5f5, #94a3b8)' : leader.rank === 3 ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'linear-gradient(135deg, #38bdf8, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        fontWeight: 700
                      }}>
                      {leader.rank}
                    </div>
                    <div>
                        <div style={{ color: 'var(--white-color)', fontWeight: 600 }}>{leader.ensName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.65)' }}>
                          {leader.transactions} transacciones • {leader.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--white-color)', fontWeight: 600 }}>{leader.reputation}/1000</div>
                      <span className="status-chip status-chip--ghost">Top reputación</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div
              className="membership-section-card"
              style={{ background: 'rgba(15,23,42,0.55)' }}
              ref={el => {
                tabContentRef.current = el
              }}
            >
              <h2 className="membership-section-title">Eventos comunitarios</h2>
              <p className="membership-section-subtitle">
                Participa en talleres, meetups y actividades presenciales de la red MicroPay MX.
              </p>
              <div className="membership-list" style={{ gap: '1rem' }}>
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="membership-list-item"
                    style={{ alignItems: 'flex-start', gap: '1rem' }}
                    ref={el => (eventCardsRef.current[index] = el)}
                  >
                    <div className="membership-avatar" style={{ width: 48, height: 48, fontSize: '1rem', background: 'rgba(59,130,246,0.25)', color: '#93c5fd' }}>
                      {event.type.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>{event.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.7)' }}>{event.attendees} asistentes confirmados</div>
                        </div>
                        <span className="status-chip status-chip--ghost" style={{ textTransform: 'capitalize' }}>{event.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'rgba(226,232,240,0.7)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} />
                          {formatDate(event.date)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.85rem' }}>
                        <button className="membership-hero__cta" style={{ justifyContent: 'center' }}>
                          Confirmar asistencia
                        </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {activeTab === 'support' && (
            <div
              className="membership-section-card"
              style={{ background: 'rgba(15,23,42,0.55)' }}
              ref={el => {
                tabContentRef.current = el
              }}
            >
              <h2 className="membership-section-title">Centro de soporte</h2>
              <div className="membership-list" style={{ gap: '1rem' }}>
                <div
                  className="membership-list-item"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}
                  ref={el => (supportCardsRef.current[0] = el)}
                >
                  <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>Documentación rápida</div>
                  <div className="bond-chip-group" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="status-chip status-chip--ghost">Guía de inicio</span>
                    <span className="status-chip status-chip--ghost">Sistema de reputación</span>
                    <span className="status-chip status-chip--ghost">CulturaChain para creadores</span>
                  </div>
                </div>
                <div
                  className="membership-list-item"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}
                  ref={el => (supportCardsRef.current[1] = el)}
                >
                  <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>Contactos directos</div>
                  <div className="bond-chip-group" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="status-chip" style={{ cursor: 'pointer' }}>💬 Chat en vivo</span>
                    <span className="status-chip" style={{ cursor: 'pointer' }}>📧 support@micropay.mx</span>
                    <span className="status-chip" style={{ cursor: 'pointer' }}>🐛 Reportar bug</span>
                  </div>
                </div>
              </div>
          </div>
          )}
        </div>
      </section>

      <section className="membership-section">
        <div
          className="membership-gradient-card"
          style={{ display: 'grid', gap: '1.25rem' }}
          ref={insightSectionRef}
        >
          <h3 className="membership-section-title">Cómo medimos la participación</h3>
          <div className="membership-list" style={{ gap: '0.75rem' }}>
            <div className="membership-list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>Crecimiento sostenible</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.7)' }}>
                  Usamos métricas on-chain y en la app para calibrar incentivos a cooperativas creativas.
                </div>
              </div>
              <TrendingUp size={20} style={{ color: 'rgba(94,234,212,0.95)' }} />
            </div>
            <div className="membership-list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>Soporte colaborativo</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.7)' }}>
                  La reputación aumenta cuando ayudas a otros usuarios a resolver dudas o completar proyectos.
                </div>
              </div>
              <Heart size={20} style={{ color: 'rgba(248,113,113,0.95)' }} />
            </div>
            <div className="membership-list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white-color)' }}>Sinergia MicroPay + CulturaChain</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.7)' }}>
                  Tu impacto se refleja en ambas plataformas, potenciando préstamos, regalías y voto comunitario.
          </div>
        </div>
              <Award size={20} style={{ color: 'rgba(192,132,252,0.95)' }} />
        </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Community
