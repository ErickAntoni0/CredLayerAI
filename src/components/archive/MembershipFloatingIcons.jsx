import React from 'react'

const floatingIcons = [
  {
    id: 'primary-badge',
    hexSrc: '/membership/assets/polygon-1.svg',
    logoSrc: '/membership/assets/project-logo.png',
    logoWidth: 43,
    className: 'floating-icon--primary'
  },
  {
    id: 'secondary-badge',
    hexSrc: '/membership/assets/polygon-1.svg',
    logoSrc: '/membership/assets/project-logo-small.png',
    logoWidth: 16,
    className: 'floating-icon--secondary'
  }
]

const MembershipFloatingIcons = ({ position = 'hero' }) => (
  <div className={`membership-floating-icons membership-floating-icons--${position}`}>
    {floatingIcons.map(icon => (
      <div key={icon.id} className={`membership-floating-icon ${icon.className}`}>
        <div className="membership-floating-icon__inner">
          <img src={icon.hexSrc} alt="" className="membership-floating-icon__hex" />
          <img
            src={icon.logoSrc}
            alt="MicroPay badge"
            width={icon.logoWidth}
            className="membership-floating-icon__logo"
          />
        </div>
      </div>
    ))}
  </div>
)

export default MembershipFloatingIcons

