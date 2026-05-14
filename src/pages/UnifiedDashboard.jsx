import React, { useState } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { Users, DollarSign, Shield, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UnifiedDashboard = () => {
  const { userProfile, isLoadingProfile } = useWalletConnection();
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

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Conecta tu wallet para ver el dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Necesitas conectar tu wallet para acceder al dashboard unificado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Unificado MicroPay MX Platform
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Bienvenido, {userProfile.ensName || userProfile.address?.slice(0, 6)}...
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
            MicroPay MX
          </span>
          {userProfile.platform === 'both' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">
              CulturaChain MX
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="payment-card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Reputación Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile.reputationScore || 0}/1000
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +12.5% este mes
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="payment-card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Plataformas Activas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile.platform === 'both' ? '2' : '1'}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {userProfile.platform === 'both' ? 'Completo' : 'Parcial'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="payment-card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $2,450
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +8.2% este mes
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="payment-card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Nivel de Usuario
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile.reputationScore >= 800 ? 'Experto' : 
                     userProfile.reputationScore >= 600 ? 'Avanzado' : 
                     userProfile.reputationScore >= 400 ? 'Intermedio' : 'Principiante'}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Beneficios activos
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráfica de ingresos combinados */}
          <div className="payment-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ingresos por Plataforma
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'microPay' ? 'MicroPay MX' : 'CulturaChain MX']}
                  labelStyle={{ color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="microPay" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="microPay"
                />
                <Line 
                  type="monotone" 
                  dataKey="culturaChain" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="culturaChain"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de plataformas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="payment-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribución de Actividad
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="payment-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Evolución de Reputación
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reputationHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="microPay" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="culturaChain" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'micropay' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              MicroPay MX
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sistema de pagos y microcréditos descentralizados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">💸</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pagos P2P
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Envía y recibe pagos con stablecoins
                </p>
                <button className="wallet-button w-full">
                  Realizar Pago
                </button>
              </div>
            </div>

            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Microcréditos
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Solicita préstamos comunitarios
                </p>
                <button className="wallet-button w-full">
                  Solicitar Préstamo
                </button>
              </div>
            </div>

            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Estadísticas
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Historial y métricas de actividad
                </p>
                <button className="wallet-button w-full">
                  Ver Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'culturachain' && userProfile.platform === 'both' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              CulturaChain MX
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Plataforma para creadores de contenido
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Suscripciones
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Gestiona tus suscriptores y royalties
                </p>
                <button className="wallet-button w-full">
                  Ver Suscriptores
                </button>
              </div>
            </div>

            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  NFTs
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Crea y vende NFTs de tu contenido
                </p>
                <button className="wallet-button w-full">
                  Crear NFT
                </button>
              </div>
            </div>

            <div className="loan-card">
              <div className="text-center">
                <div className="text-4xl mb-4">🚨</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Fondo de Emergencia
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Accede a crédito basado en tu reputación
                </p>
                <button className="wallet-button w-full">
                  Solicitar Fondo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'culturachain' && userProfile.platform !== 'both' && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Únete a CulturaChain MX
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Expande tu reputación y monetiza tu contenido creativo
          </p>
          <button className="wallet-button">
            Registrarse en CulturaChain MX
          </button>
        </div>
      )}

      {/* Hackathon Info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          🏆 Ethereum México Hackathon 2025
        </h2>
        <p className="text-lg mb-6 opacity-90">
          MicroPay MX Platform - Infraestructura financiera descentralizada
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">$15,000</div>
            <div className="text-sm opacity-90">USD en Premios</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">7</div>
            <div className="text-sm opacity-90">Tracks Cubiertos</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">2</div>
            <div className="text-sm opacity-90">Plataformas</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-sm opacity-90">Descentralizado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
