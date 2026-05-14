import React from 'react'
import { Link } from 'react-router-dom'

const floatingIcons = [
  {
    src: 'https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d68f19a2c3d65a4d43742f_icon-solana.svg',
    alt: 'Solana',
    style: { top: '18%', right: '16%', width: '44px' }
  },
  {
    src: 'https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d6904ea2b2cc6f459aee7d_icon-arbitrum.svg',
    alt: 'Arbitrum',
    style: { top: '66%', left: '8%', width: '54px' }
  },
  {
    src: 'https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d6904f4ad80c1a0a2f4c5f_icon-polygon.svg',
    alt: 'Polygon',
    style: { top: '70%', right: '14%', width: '50px' }
  },
  {
    src: 'https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d6904fa2b2cc83cc9aee7e_icon-binance.svg',
    alt: 'Binance',
    style: { top: '45%', right: '8%', width: '48px' }
  },
  {
    src: 'https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d690510459fc1fbe1d4e63_icon-optimism.svg',
    alt: 'Optimism',
    style: { bottom: '16%', left: '46%', width: '40px' }
  }
]

const navLinks = [
  { label: 'Launch App', to: '/index3' },
  { label: 'Pagos', to: '/payments' },
  { label: 'Préstamos', to: '/loans' },
  { label: 'Comunidad', to: '/community' },
  { label: 'Ingresar', to: '/Dashboard' },
]

const MembershipHeroIndex3 = ({ walletAddress }) => {
  const walletLabel = walletAddress ? `Wallet conectada · ${walletAddress}` : 'Conecta tu wallet para comenzar'

  return (
    <section className="membership-landing-hero">
      <div className="membership-landing-hero__background">
        <img
          src="https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d577db4b7899c7b79f05d5_Asset%207%4016x-8%201.png"
          alt="MicroPay background"
          className="membership-landing-hero__orb"
        />
      </div>

      {floatingIcons.map((icon) => (
        <img
          key={icon.alt}
          src={icon.src}
          alt={icon.alt}
          className="membership-landing-hero__floating"
          style={icon.style}
        />
      ))}

      <div className="membership-landing-hero__content">
        <div className="membership-landing-hero__logo">
          <img
            src="https://cdn.prod.website-files.com/62d56cdfee83ff60e9a6bb30/62d57092a8c31a3e4f6b512d_Component%201.svg"
            alt="MicroPay Logo"
          />
        </div>

        <nav className="membership-landing-hero__nav">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="membership-landing-hero__wallet">
          {walletLabel}
        </div>

        <h1 className="membership-landing-hero__title">Bienvenido a MicroPay MX Platform!</h1>
        <p className="membership-landing-hero__subtitle">
          Somos una plataforma descentralizada para el ecosistema creativo mexicano.
        </p>

        <button className="membership-landing-hero__cta-primary">Solicítala ahora</button>

        <div className="membership-landing-hero__indicator">
          <span />
          <span />
        </div>
      </div>
    </section>
  )
}

export default MembershipHeroIndex3

