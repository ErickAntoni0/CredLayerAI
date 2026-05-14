import React, { useState } from 'react';
import { Wallet, ArrowRight, Shield, Zap, Users, Star } from 'lucide-react';
import { useWalletConnection } from '../hooks/useWalletConnection';

const WalletConnectEnhanced = () => {
  const {
    connectors,
    connectWallet,
    isLoading,
    error,
    userProfile,
    registerMicroPayUser,
    registerCulturaChainUser
  } = useWalletConnection();

  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    ensName: '',
    subdomain: '',
    creatorCategory: '',
    description: ''
  });

  const creatorCategories = [
    { id: 'musician', name: 'Músico', icon: '🎵' },
    { id: 'artist', name: 'Artista Visual', icon: '🎨' },
    { id: 'writer', name: 'Escritor', icon: '✍️' },
    { id: 'podcaster', name: 'Podcaster', icon: '🎙️' },
    { id: 'youtuber', name: 'YouTuber', icon: '📹' },
    { id: 'streamer', name: 'Streamer', icon: '🎮' },
    { id: 'photographer', name: 'Fotógrafo', icon: '📸' },
    { id: 'craftsman', name: 'Artesano', icon: '🔨' }
  ];

  const handleRegistration = async (platform) => {
    try {
      if (platform === 'micropay') {
        await registerMicroPayUser(registrationData.ensName, registrationData.subdomain);
      } else if (platform === 'culturachain') {
        await registerCulturaChainUser(registrationData.creatorCategory, registrationData.description);
      }
      setShowRegistration(false);
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  // Si el usuario ya está conectado, mostrar su perfil
  if (userProfile) {
    return (
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header del perfil */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">
                {userProfile.platform === 'both' ? '🌟' : '💎'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {userProfile.ensName || 'Usuario'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {userProfile.platform === 'both' 
                ? 'MicroPay MX + CulturaChain MX' 
                : userProfile.platform === 'micropay' 
                  ? 'MicroPay MX' 
                  : 'CulturaChain MX'
              }
            </p>
          </div>

          {/* Información del perfil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Reputación</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userProfile.reputationScore || 0}/1000
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Plataformas</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userProfile.platform === 'both' ? '2' : '1'}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Nivel</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userProfile.reputationScore >= 800 ? 'Experto' : 
                 userProfile.reputationScore >= 600 ? 'Avanzado' : 
                 userProfile.reputationScore >= 400 ? 'Intermedio' : 'Principiante'}
              </p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="wallet-button text-center py-4">
              <div className="text-2xl mb-2">💸</div>
              <div className="font-semibold">MicroPay MX</div>
              <div className="text-sm opacity-90">Pagos y microcréditos</div>
            </button>
            
            {userProfile.platform === 'both' && (
              <button className="wallet-button text-center py-4">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-semibold">CulturaChain MX</div>
                <div className="text-sm opacity-90">Para creadores</div>
              </button>
            )}
            
            {userProfile.platform === 'micropay' && (
              <button 
                onClick={() => setShowRegistration(true)}
                className="wallet-button text-center py-4"
              >
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-semibold">Unirse a CulturaChain</div>
                <div className="text-sm opacity-90">Expandir reputación</div>
              </button>
            )}
          </div>
        </div>

        {/* Modal de registro */}
        {showRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Unirse a CulturaChain MX
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría de Creador
                  </label>
                  <select
                    value={registrationData.creatorCategory}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, creatorCategory: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecciona una categoría</option>
                    {creatorCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={registrationData.description}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Cuéntanos sobre tu trabajo creativo..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowRegistration(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRegistration('culturachain')}
                  className="flex-1 wallet-button"
                >
                  Unirse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pantalla de conexión inicial
  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo y título */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            MicroPay MX Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Infraestructura financiera descentralizada para México
          </p>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Reputación ENS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Identidad descentralizada verificada</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Arbitrum & Scroll</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Transacciones rápidas y económicas</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Multi-Plataforma</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">MicroPay + CulturaChain MX</p>
            </div>
          </div>
        </div>

        {/* Botones de conexión */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conecta tu Wallet
          </h3>
          
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connectWallet(connector.id)}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-5 h-5" />
              <span>
                {isLoading ? 'Conectando...' : `Conectar ${connector.name}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error.message}
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Al conectar tu wallet, aceptas nuestros términos de servicio y política de privacidad.
            <br />
            <span className="font-semibold">¡Participa en el hackathon Ethereum México 2025!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectEnhanced;
