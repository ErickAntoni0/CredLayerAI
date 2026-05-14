import React, { useState } from 'react';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { TrendingUp, Users, DollarSign, Shield, Star, Heart, ArrowUpRight, CreditCard, Banknote, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProfessionalDashboard = () => {
  const { userProfile, isLoadingProfile } = useWalletConnection();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Datos mock para las gráficas
  const paymentHistory = [
    { month: 'Ene', microPay: 1200, culturaChain: 800 },
    { month: 'Feb', microPay: 1900, culturaChain: 1200 },
    { month: 'Mar', microPay: 3000, culturaChain: 1800 },
    { month: 'Abr', microPay: 2800, culturaChain: 2200 },
    { month: 'May', microPay: 1890, culturaChain: 1500 },
    { month: 'Jun', microPay: 2390, culturaChain: 2000 },
  ];

  const reputationHistory = [
    { month: 'Ene', microPay: 100, culturaChain: 0 },
    { month: 'Feb', microPay: 120, culturaChain: 50 },
    { month: 'Mar', microPay: 150, culturaChain: 80 },
    { month: 'Abr', microPay: 180, culturaChain: 120 },
    { month: 'May', microPay: 200, culturaChain: 150 },
    { month: 'Jun', microPay: 220, culturaChain: 180 },
  ];

  const platformDistribution = [
    { name: 'MicroPay MX', value: 65, color: '#3B82F6' },
    { name: 'CulturaChain MX', value: 35, color: '#8B5CF6' },
  ];

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'micropay', name: 'MicroPay MX', icon: '💸' },
    { id: 'culturachain', name: 'CulturaChain MX', icon: '🎨' },
    { id: 'reputation', name: 'Reputación', icon: '⭐' },
    { id: 'analytics', name: 'Analíticas', icon: '📈' }
  ];

  const quickActions = [
    { name: 'Enviar Pago', icon: CreditCard, color: 'from-blue-500 to-blue-600', href: '/payments' },
    { name: 'Solicitar Préstamo', icon: Banknote, color: 'from-green-500 to-green-600', href: '/loans' },
    { name: 'Mi Perfil', icon: Users, color: 'from-purple-500 to-purple-600', href: '/profile' },
    { name: 'Comunidad', icon: Heart, color: 'from-pink-500 to-pink-600', href: '/community' }
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Dashboard <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Unificado</span>
        </h1>
        <p className="text-xl text-white/80 font-light">
          Bienvenido, {userProfile?.ensName || 'Usuario'}
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
            MicroPay MX
          </span>
          {userProfile?.platform === 'both' && (
            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
              CulturaChain MX
            </span>
          )}
        </div>
      </div>

      {/* Stats principales con diseño glass */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-3xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                Reputación Total
              </p>
              <p className="text-3xl font-black text-white mb-2">
                {userProfile?.reputationScore || 0}/1000
              </p>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">
                  +12.5% este mes
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                Balance USDC
              </p>
              <p className="text-3xl font-black text-white mb-2">
                {showBalance ? '$2,450.00' : '••••••'}
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <p className="text-sm text-green-400 font-medium">
                  +8.2% este mes
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                Plataformas Activas
              </p>
              <p className="text-3xl font-black text-white mb-2">
                {userProfile?.platform === 'both' ? '2' : '1'}
              </p>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">
                  {userProfile?.platform === 'both' ? 'Completo' : 'Parcial'}
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                Nivel de Usuario
              </p>
              <p className="text-3xl font-black text-white mb-2">
                {userProfile?.reputationScore >= 800 ? 'Experto' : 
                 userProfile?.reputationScore >= 600 ? 'Avanzado' : 
                 userProfile?.reputationScore >= 400 ? 'Intermedio' : 'Principiante'}
              </p>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <p className="text-sm text-yellow-400 font-medium">
                  Beneficios activos
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="glass-effect rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>
              <h3 className="text-white font-semibold text-lg group-hover:text-white/90 transition-colors">
                {action.name}
              </h3>
            </a>
          ))}
        </div>
      </div>

      {/* Tabs para diferentes vistas */}
      <div className="flex flex-wrap justify-center space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Gráfica de ingresos combinados */}
          <div className="glass-effect rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Ingresos por Plataforma</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={paymentHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }}
                  formatter={(value, name) => [`$${value}`, name === 'microPay' ? 'MicroPay MX' : 'CulturaChain MX']}
                />
                <Line 
                  type="monotone" 
                  dataKey="microPay" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  name="microPay"
                />
                <Line 
                  type="monotone" 
                  dataKey="culturaChain" 
                  stroke="#8B5CF6" 
                  strokeWidth={4}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  name="culturaChain"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de plataformas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-effect rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Distribución de Actividad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-effect rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Evolución de Reputación</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reputationHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="microPay" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="culturaChain" 
                    stroke="#8B5CF6" 
                    strokeWidth={4}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Información del Hackathon */}
      <div className="hero-gradient rounded-3xl p-8 text-white text-center">
        <h2 className="text-3xl font-black mb-6">
          🏆 Ethereum México Hackathon 2025
        </h2>
        <p className="text-xl mb-8 opacity-90">
          MicroPay MX Platform - Infraestructura financiera descentralizada
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-black mb-2">$15,000</div>
            <div className="text-sm opacity-90">USD en Premios</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2">7</div>
            <div className="text-sm opacity-90">Tracks Cubiertos</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2">2</div>
            <div className="text-sm opacity-90">Plataformas</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2">100%</div>
            <div className="text-sm opacity-90">Descentralizado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
