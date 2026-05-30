import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import Landing from './pages/Landing'
import SimpleMetaMask from './components/SimpleMetaMask'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Loans from './pages/Loans'
import Profile from './pages/Profile'
import Community from './pages/Community'
import UnifiedDashboard from './pages/UnifiedDashboard'
import ProfessionalDashboard from './pages/archive/ProfessionalDashboard'
import AboutUs from './pages/Abbout'
import GetStarted from './pages/GetStarted'
import Nova from './pages/Nova'

function RedirectToStaticLanding() {
  React.useEffect(() => {
    window.location.href = '/landing/index.html'
  }, [])
  return null
}

function App() {
  const { isConnected } = useAccount()
  const walletConnected = localStorage.getItem('walletConnected') === 'true' || isConnected

  // Si no hay wallet conectada, mostrar flujo público (membership -> landing -> conectar)
  if (!walletConnected) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/connect" element={<SimpleMetaMask />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/community" element={<Community />} />
        <Route path="/launch" element={<Navigate to="/connect" replace />} />
        {/* Redirecciones de páginas de la app a la pantalla de conexión */}
        <Route path="/dashboard" element={<Navigate to="/connect" replace />} />
        <Route path="/payments" element={<Navigate to="/connect" replace />} />
        <Route path="/loans" element={<Navigate to="/connect" replace />} />
        <Route path="/profile" element={<Navigate to="/connect" replace />} />
        <Route path="/unified" element={<Navigate to="/connect" replace />} />
        <Route path="/professional" element={<Navigate to="/connect" replace />} />
        <Route path="/nova" element={<Navigate to="/connect" replace />} />
        <Route path="*" element={<RedirectToStaticLanding />} />
      </Routes>
    )
  }

  // Rutas protegidas con Layout
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/community" element={<Community />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/nova" element={<Nova />} />
        <Route path="/unified" element={<UnifiedDashboard />} />
        <Route path="/professional" element={<ProfessionalDashboard />} />
      </Route>
      <Route path="/launch" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<RedirectToStaticLanding />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App