import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import {
  CreditCard,
  Landmark,
  User,
  Users,
  Home,
  ArrowLeftRight,
  Menu,
  X,
  Wallet,
  Sparkles,
  Brain
} from 'lucide-react'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { AiAssistantProvider } from '../context/AiAssistantContext'
import AIAssistantChat from './AIAssistantChat'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { userProfile, reputationScore, connectWallet, connectors } = useWalletConnection()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const handleDisconnect = () => {
    disconnect()
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
    navigate('/')
  }

  const navLinks = useMemo(
    () => [
      { path: '/landing/index.html', label: 'Home', icon: Home },
      { path: '/payments', label: 'Payments', icon: CreditCard },
      { path: '/loans', label: 'Loans', icon: Landmark },
      { path: '/nova', label: 'NOVA | IA', icon: Brain },
      { path: '/profile', label: 'Profile', icon: User }
    ],
    []
  )

  const activePath = useMemo(() => {
    const pathname = location.pathname
    const matched = navLinks.find(link => pathname === link.path || pathname.startsWith(`${link.path}/`))
    return matched ? matched.path : pathname
  }, [location.pathname, navLinks])

  const hideHeader = false

  const formattedAddress = useMemo(() => {
    if (!address) return null
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [address])

  const handleNavigate = (path) => {
    if (path.endsWith('.html')) {
      window.location.href = path
      return
    }
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <AiAssistantProvider>
      <div className="layout-container">
        {!hideHeader && (
          <header className="sticky">
            <div className="header-content">
              <Link to="/dashboard" className="logo-link">
                <img src="/landing/Logo.png" alt="CredLayer AI" style={{ height: '36px', width: 'auto', display: 'block' }} />
              </Link>

              <nav className="nav-menu">
                {navLinks.map(link => {
                  const isActive = activePath === link.path
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => handleNavigate(link.path)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon">
                        <link.icon size={18} strokeWidth={1.6} />
                      </span>
                      <span className="nav-label">{link.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="header-actions">
                {isConnected && (
                  <div className="flex items-center gap-3">
                    {/* Network & Account Combined */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 pl-4 pr-1 gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${chain?.unsupported ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{chain?.name || 'Network'}</span>
                      </div>

                      <div className="h-4 w-px bg-gray-200"></div>

                      <div className="flex items-center gap-3 bg-black text-white px-4 py-1.5 rounded-full shadow-sm">
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Verified Account</span>
                          <span className="text-xs font-bold font-mono">{userProfile?.ensName || formattedAddress}</span>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded-lg">
                          <span className="text-xs font-black">{reputationScore} PTS</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtle Disconnect */}
                    <button
                      onClick={handleDisconnect}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="Disconnect Wallet"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {!isConnected && (
                  <div className="relative">
                    <button
                      onClick={() => setIsWalletModalOpen(!isWalletModalOpen)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-sm"
                    >
                      <Wallet size={18} />
                      <span>Connect Wallet</span>
                    </button>

                    {isWalletModalOpen && (
                      <div className="absolute right-0 mt-4 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Select Provider</p>
                        <div className="space-y-2">
                          {connectors.map((conn) => (
                            <button
                              key={conn.id}
                              onClick={() => {
                                connectWallet(conn.id)
                                setIsWalletModalOpen(false)
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                            >
                              <span className="font-semibold text-black">{conn.name}</span>
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="mobile-nav-toggle lg:hidden"
                  onClick={() => setIsMobileMenuOpen(prev => !prev)}
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="mobile-nav">
                {navLinks.map(link => {
                  const isActive = activePath === link.path
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => handleNavigate(link.path)}
                      className={`mobile-nav__item ${isActive ? 'active' : ''}`}
                    >
                      <span className="mobile-nav__icon">
                        <link.icon size={18} strokeWidth={1.6} />
                      </span>
                      <span>{link.label}</span>
                    </button>
                  )
                })}

                {isConnected && formattedAddress && (
                  <div className="mobile-nav__wallet">
                    <div className="mobile-nav__address">{formattedAddress}</div>
                    <button type="button" onClick={handleDisconnect} className="disconnect-btn">
                      Desconectar
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <AIAssistantChat />
    </AiAssistantProvider>
  )
}

export default Layout

