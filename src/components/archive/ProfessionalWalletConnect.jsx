import React, { useState } from 'react';
import { Wallet, ArrowRight, Shield, Zap, Users, CheckCircle, Sparkles } from 'lucide-react';

const ProfessionalWalletConnect = ({ connectors, connect, error, isLoading }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const features = [
    {
      icon: Shield,
      title: "Reputación ENS",
      description: "Identidad descentralizada verificada",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Arbitrum & Scroll",
      description: "Transacciones rápidas y económicas",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Comunidad Global",
      description: "Red de usuarios verificados",
      color: "from-green-500 to-green-600"
    }
  ];

  const stats = [
    { number: "$15,000", label: "USD en Premios" },
    { number: "7", label: "Tracks Cubiertos" },
    { number: "100%", label: "Descentralizado" },
    { number: "🇲🇽", label: "México" }
  ];

  // Función para conectar con MetaMask directamente
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Recargar la página para que Wagmi detecte la conexión
        window.location.reload();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full opacity-25 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header con logo profesional */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl mb-6 animate-float">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            MicroPay <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">MX</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
            Infraestructura financiera descentralizada para la inclusión económica en México
          </p>
        </div>

        {/* Estadísticas del hackathon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="glass-effect rounded-2xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-white/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="glass-effect rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sección de conexión de wallet */}
        <div className="glass-effect rounded-3xl p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Conecta tu Wallet
            </h2>
            <p className="text-white/80">
              Únete a la revolución financiera descentralizada
            </p>
          </div>

          {/* Botones de conexión mejorados */}
          <div className="space-y-4">
            {/* Botón de MetaMask directo */}
            <button
              onClick={connectMetaMask}
              disabled={isLoading}
              onMouseEnter={() => setHoveredButton('metaMask')}
              onMouseLeave={() => setHoveredButton(null)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                hoveredButton === 'metaMask'
                  ? 'bg-white/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-lg">
                    {isLoading ? 'Conectando...' : 'Conectar MetaMask'}
                  </div>
                  <div className="text-white/70 text-sm">
                    Conexión directa con MetaMask
                  </div>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 text-white transition-transform duration-300 ${
                hoveredButton === 'metaMask' ? 'translate-x-1' : ''
              }`} />
            </button>

            {/* Botones de Wagmi */}
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                disabled={isLoading}
                onMouseEnter={() => setHoveredButton(connector.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                  hoveredButton === connector.id
                    ? 'bg-white/20 scale-105'
                    : 'bg-white/10 hover:bg-white/15'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">
                      {isLoading ? 'Conectando...' : `Conectar ${connector.name}`}
                    </div>
                    <div className="text-white/70 text-sm">
                      {connector.id === 'metaMask' ? 'Conexión directa' : 'Código QR disponible'}
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-white transition-transform duration-300 ${
                  hoveredButton === connector.id ? 'translate-x-1' : ''
                }`} />
              </button>
            ))}
          </div>

          {/* Mensaje de error mejorado */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-sm">!</span>
                </div>
                <div>
                  <div className="text-red-200 font-medium">Error de Conexión</div>
                  <div className="text-red-300/80 text-sm">
                    {error.message.includes('rejected') 
                      ? 'Conexión cancelada por el usuario' 
                      : 'Error al conectar la wallet'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/70 text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>Seguro y descentralizado</span>
            </div>
            <p className="text-center text-white/60 text-xs leading-relaxed">
              Al conectar tu wallet, aceptas nuestros términos de servicio y política de privacidad.
              <br />
              <span className="font-semibold text-yellow-300">
                ¡Participa en el hackathon Ethereum México 2025!
              </span>
            </p>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-6 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Arbitrum Stylus</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>ENS Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Scroll L2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWalletConnect;
