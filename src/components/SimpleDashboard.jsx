import React from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useNetwork, useBalance } from 'wagmi'
import { Banknote, Landmark, Trophy, Users } from 'lucide-react'

const quickActions = [
  { icon: <Banknote size={20} />, label: 'Enviar pago', hint: 'USDC instantáneo', href: '/payments' },
  { icon: <Landmark size={20} />, label: 'Solicitar crédito', hint: 'Microcréditos ENS', href: '/loans' },
  { icon: <Trophy size={20} />, label: 'Gestionar reputación', hint: 'Perfil y badges ENS', href: '/profile' },
  { icon: <Users size={20} />, label: 'Explorar comunidad', hint: 'Eventos y misiones', href: '/community' },
]

const kpiCards = [
  { value: '$0.00', label: 'Total enviado este mes' },
  { value: '0', label: 'Microcréditos activos' },
  { value: '0%', label: 'Tasa de éxito' },
  { value: 'Nivel 0', label: 'Reputación ENS' }
]

const placeholderActivity = [
  { title: 'Sin movimientos recientes', subtitle: 'Los pagos que envíes o recibas aparecerán aquí.' }
]

const placeholderCommunity = [
  { title: 'Próximamente: misiones comunitarias', subtitle: 'Activa las misiones para ganar recompensas y visibilidad.' }
]

const SimpleDashboard = () => {
  const { address } = useAccount()
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet conectada'
  const { chain } = useNetwork()
  const { data: nativeBalance } = useBalance({
    address,
    enabled: Boolean(address),
    watch: Boolean(address)
  })

  const formatCurrency = (value) => {
    if (!value) return '0.00'
    const amount = parseFloat(value)
    if (Number.isNaN(amount)) return '0.00'
    return amount < 1 ? amount.toFixed(4) : amount.toFixed(2)
  }

  return (
    <div className="membership-page">
      <section className="membership-section">
        <div className="membership-section-card">
          <h2 className="membership-section-title">Resumen de tu cuenta</h2>
          <p className="membership-section-subtitle">
            Gestiona tu espacio financiero desde aquí. Te mostraremos balances, reputación y próximos pasos.
          </p>
          <div className="membership-stat-section">
            <div className="membership-stat-card" style={{ textAlign: 'left' }}>
              <div className="membership-stat-label">Wallet conectada</div>
              <div className="membership-stat-value" style={{ fontSize: '1.3rem' }}>{shortAddress}</div>
            </div>
            <div className="membership-stat-card" style={{ textAlign: 'left' }}>
              <div className="membership-stat-label">Red actual</div>
              <div className="membership-stat-value" style={{ fontSize: '1.3rem' }}>
  {chain?.name ?? 'Detectando...'}
</div>

            </div>
            <div className="membership-stat-card" style={{ textAlign: 'left' }}>
              <div className="membership-stat-label">Balance ({nativeBalance?.symbol ?? 'ETH'})</div>
              <div className="membership-stat-value" style={{ fontSize: '1.3rem' }}>{formatCurrency(nativeBalance?.formatted)}</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/profile" className="membership-hero__cta membership-hero__cta--ghost" style={{ textDecoration: 'none' }}>
              Gestionar perfil
            </Link>
          </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-section-card">
          <h2 className="membership-section-title">Acciones rápidas</h2>
          <p className="membership-section-subtitle">
            Atajos para comenzar a operar. Conecta los módulos principales para activar toda la experiencia MicroPay.
          </p>
          <div className="membership-feature-grid">
            {quickActions.map((action) => (
              <a key={action.label} href={action.href} className="membership-feature-card" style={{ textDecoration: 'none' }}>
                <div className="membership-feature-icon">{action.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--white-color)' }}>{action.label}</h3>
                <p style={{ color: 'rgba(226,232,240,0.7)' }}>{action.hint}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-section-card">
          <h2 className="membership-section-title">Indicadores clave</h2>
          <div className="membership-stat-section">
            {kpiCards.map((kpi) => (
              <div key={kpi.label} className="membership-stat-card">
                <div className="membership-stat-value">{kpi.value}</div>
                <div className="membership-stat-label">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-section-card">
          <h2 className="membership-section-title">Movimientos recientes</h2>
          <div className="membership-list">
            {placeholderActivity.map((item) => (
              <div key={item.title} className="membership-list-item">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--white-color)', fontWeight: 600 }}>{item.title}</span>
                  <span style={{ color: 'rgba(226,232,240,0.65)', fontSize: '0.9rem' }}>{item.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-section-card">
          <h2 className="membership-section-title">Comunidad y próximos pasos</h2>
          <div className="membership-list">
            {placeholderCommunity.map((item) => (
              <div key={item.title} className="membership-list-item">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--white-color)', fontWeight: 600 }}>{item.title}</span>
                  <span style={{ color: 'rgba(226,232,240,0.65)', fontSize: '0.9rem' }}>{item.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SimpleDashboard
