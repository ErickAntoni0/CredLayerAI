import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users, ShieldCheck, Wallet, LineChart, Layers } from 'lucide-react'

import { useWalletConnection } from '../hooks/useWalletConnection'
import { usePaymentsData } from '../hooks/usePaymentsData'
import { useLoansData } from '../hooks/useLoansData'

import '../styles/landing-hero.css';
import '../styles/neon-gauge.css';
import NeonGauge from '../components/NeonGauge';

const microcopy = {
  heroTitle: 'Infraestructura DeFi pensada para comunidades mexicanas',
  heroSubtitle:
    'CredLayer AI une registro inmutable de pagos y reputación ENS en un dashboard descentralizado con experiencia Web3.',
}

const featureBlocks = [
  {
    id: 'pagos',
    eyebrow: 'Pagos comunitarios',
    title: 'Liquidaciones en segundos con comisiones mínimas',
    description:
      'Enrutamos transacciones sobre Arbitrum y Scroll con monitoreo en tiempo real. Integrado con USDC, stablecoins locales y gas subsidiado para cooperativas.',
    cta: { label: 'Ir a Pagos', to: '/payments' },
    icon: Wallet,
  },
  {
    id: 'creditos',
    eyebrow: 'Microcréditos Web3',
    title: 'Fondea y gestiona préstamos P2P con reputación ENS',
    description:
      'Matching inteligente entre solicitantes y fondeadores. Motor de riesgo con datos on-chain, tasas definidas en comunidad y contratos Stylus listos para producción.',
    cta: { label: 'Explorar Préstamos', to: '/loans' },
    icon: ShieldCheck,
  },
  {
    id: 'comunidad',
    eyebrow: 'Ecosistema creativo',
    title: 'Gobernanza y participación para creadores',
    description:
      'Panel colaborativo con eventos, líderes y métricas culturales. Tu reputación se sincroniza con CulturaChain MX y se usa para desbloquear líneas de crédito.',
    cta: { label: 'Unirme a la comunidad', to: '/community' },
    icon: Users,
  },
]

const proofPoints = [
  {
    title: 'Stylus + Scroll',
    copy: 'Contratos en Rust y Solidity listos para desplegar sobre Arbitrum Stylus y Scroll L2.',
  },
  {
    title: 'Integración ENS',
    copy: 'Verificamos identidades, emitimos subdominios comunitarios y calculamos reputación multicadena.',
  },
  {
    title: 'UX profesional',
    copy: 'Experiencia de usuario inspirada en plataformas DeFi premium pero con un toque local y accesible.',
  },
]

const Landing = () => {
  const { userProfile, address, reputationScore, chain } = useWalletConnection()
  const { data: paymentsData } = usePaymentsData(address)
  const { data: loansData } = useLoansData(address)

  const formattedAddress = useMemo(() => {
    if (!address) return 'Wallet no conectada'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [address])

  const stats = useMemo(() => {
    const totalVolume = paymentsData?.metrics?.totalVolumeUsdFormatted ?? '$0'
    const supporters = loansData?.metrics?.supporters ?? 0
    const funded = loansData?.metrics?.fundedLoans ?? 0
    return [
      {
        label: 'Volumen 30 días',
        value: totalVolume,
        hint: 'Pagos confirmados en Arbitrum y Scroll',
      },
      {
        label: 'Préstamos fondeados',
        value: `${funded}`,
        hint: 'Operaciones P2P registradas en CredLayer AI',
      },
      {
        label: 'Aliados cooperativos',
        value: `${supporters}`,
        hint: 'Fondeadores comunitarios con reputación verificada',
      },
    ]
  }, [loansData, paymentsData])

  return (
    <div className="landing">
      <nav className="landing__nav">
        <div className="landing__nav-brand">
          <Sparkles size={20} />
          <span>CredLayer AI</span>
        </div>
        <div className="landing__nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/payments">Pagos</Link>
          <Link to="/loans">Préstamos</Link>
          <Link to="/community">Comunidad</Link>
        </div>
        <Link className="landing__nav-cta" to={address ? '/dashboard' : '/connect'}>
          <ArrowRight size={16} />
          {address ? 'Ir al dashboard' : 'Conectar wallet'}
        </Link>
      </nav>

      <header className="landing__hero" style={{ backgroundImage: "url('/landing_hero.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="landing__hero-content">
          <div className="landing__chip-group">
            <span className="landing__chip landing__chip--pulse">Arbitrum · Scroll · ENS</span>
            {chain?.name && <span className="landing__chip">Red activa: {chain.name}</span>}
          </div>
          <h1>{microcopy.heroTitle}</h1>
          <p>{microcopy.heroSubtitle}</p>
          <div className="landing__hero-cta">
            <Link className="landing__button landing__button--primary" to="/payments">
              <ArrowRight size={18} />
              Empezar con pagos
            </Link>
            <Link className="landing__button landing__button--ghost" to="/loans">
              Explorar microcréditos
            </Link>
          </div>
          <div className="landing__identity">
            <div className="landing__identity-item">
              <Wallet size={16} />
              <span>{formattedAddress}</span>
            </div>
            <div className="landing__identity-item">
              <ShieldCheck size={16} />
              <span>{userProfile?.isRegistered ? 'Perfil verificado' : 'Registro pendiente'}</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <NeonGauge score={reputationScore ?? 0} size={80} label="Trust Score" />
            </div>
          </div>
        </div>
        <div className="landing__hero-card hover-glow-card" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)' }}>
          <div className="landing__hero-card-header">
            <span className="landing__hero-label">Operative System</span>
            <span className="landing__hero-status">LIVE</span>
          </div>
          <div className="landing__hero-metric">
            <LineChart size={20} />
            <div>
              <strong>{stats[0].value}</strong>
              <span>{stats[0].hint}</span>
            </div>
          </div>
          <div className="landing__hero-metric">
            <Layers size={20} />
            <div>
              <strong>{stats[1].value}</strong>
              <span>{stats[1].hint}</span>
            </div>
          </div>
          <div className="landing__hero-foot">
            <span className="landing__chip landing__chip--ghost">Stylus ready</span>
            <span className="landing__chip landing__chip--ghost">ENS integrated</span>
          </div>
        </div>
      </header>

      <section className="landing__stats">
        {stats.map((stat) => (
          <article key={stat.label} className="landing__stat-card hover-glow-card">
            <span className="landing__stat-label">{stat.label}</span>
            <strong className="landing__stat-value">{stat.value}</strong>
            <span className="landing__stat-hint">{stat.hint}</span>
          </article>
        ))}
      </section>

      <section className="landing__features">
        {featureBlocks.map((block) => {
          const Icon = block.icon
          return (
            <article key={block.id} className="landing__feature-card hover-glow-card">
              <span className="landing__feature-eyebrow">{block.eyebrow}</span>
              <div className="landing__feature-icon">
                <Icon size={20} />
              </div>
              <h3>{block.title}</h3>
              <p>{block.description}</p>
              <Link className="landing__feature-link" to={block.cta.to}>
                <ArrowRight size={16} />
                {block.cta.label}
              </Link>
            </article>
          )
        })}
      </section>

      <section className="landing__proof">
        <h2>Ready for ETH México 2025 hackathon</h2>
        <div className="landing__proof-grid">
          {proofPoints.map((point) => (
            <article key={point.title} className="landing__proof-card">
              <h4>{point.title}</h4>
              <p>{point.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing__footer">
        <div>
          <span className="landing__footer-brand">CredLayer AI</span>
          <p>Pagos, créditos y comunidad Web3 con enfoque latinoamericano.</p>
        </div>
        <div className="landing__footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/unified">Panel unificado</Link>
          <Link to="/professional">Versión pro</Link>
        </div>
        <div className="landing__footer-meta">
          <span>© {new Date().getFullYear()} CredLayer AI</span>
          <span>Construido para ETH México 2025</span>
        </div>
      </footer>
    </div>
  )
}

export default Landing

