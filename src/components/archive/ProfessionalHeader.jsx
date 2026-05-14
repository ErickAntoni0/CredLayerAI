import React, { useState } from 'react';
import { Menu, X, User, Settings, LogOut, Bell, Search } from 'lucide-react';

const ProfessionalHeader = ({ address, disconnect, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Pagos', href: '/payments', icon: '💸' },
    { name: 'Préstamos', href: '/loans', icon: '💰' },
    { name: 'Perfil', href: '/profile', icon: '👤' },
    { name: 'Comunidad', href: '/community', icon: '👥' }
  ];

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getReputationLevel = (score) => {
    if (score >= 800) return { level: 'Experto', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 600) return { level: 'Avanzado', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 400) return { level: 'Intermedio', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 200) return { level: 'Principiante', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { level: 'Novato', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const reputation = getReputationLevel(userProfile?.reputationScore || 0);

  return (
    <header className="glass-effect border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CredLayer AI</h1>
              <p className="text-xs text-white/60">Platform</p>
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Búsqueda */}
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>

            {/* Perfil del usuario */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userProfile?.ensName?.charAt(0) || address?.charAt(2) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-white font-medium text-sm">
                    {userProfile?.ensName || formatAddress(address)}
                  </div>
                  <div className={`text-xs ${reputation.color}`}>
                    {reputation.level}
                  </div>
                </div>
              </button>

              {/* Dropdown del perfil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-dark rounded-2xl p-4 shadow-xl">
                  <div className="space-y-4">
                    {/* Información del usuario */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">
                          {userProfile?.ensName?.charAt(0) || address?.charAt(2) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">
                          {userProfile?.ensName || 'Usuario'}
                        </div>
                        <div className="text-white/60 text-sm">
                          {formatAddress(address)}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reputation.bg} ${reputation.color} mt-1`}>
                          {reputation.level}
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white font-bold text-lg">
                          {userProfile?.reputationScore || 0}
                        </div>
                        <div className="text-white/60 text-xs">Reputación</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white font-bold text-lg">
                          {userProfile?.platform === 'both' ? '2' : '1'}
                        </div>
                        <div className="text-white/60 text-xs">Plataformas</div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                        <User className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </button>
                      <button
                        onClick={disconnect}
                        className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden glass-dark rounded-2xl p-4 mt-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default ProfessionalHeader;
