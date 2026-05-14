import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import Landing from './pages/Landing'
import SimpleMetaMask from './components/SimpleMetaMask'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import Community from './pages/archive/Community'
import UnifiedDashboard from './pages/UnifiedDashboard'
import ProfessionalDashboard from './pages/archive/ProfessionalDashboard'

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
        <Route path="*" element={<RedirectToStaticLanding />} />
      </Routes>
    )
  }

  // Rutas protegidas con Layout
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/unified" element={<UnifiedDashboard />} />
        <Route path="/professional" element={<ProfessionalDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App