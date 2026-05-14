import React from 'react'
import { Wallet, ArrowRight, Shield, Zap } from 'lucide-react'

const WalletConnect = ({ connectors, connect, error, isLoading }) => {
  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo y título */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            MicroPay MX
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema de Pagos y Microcréditos Descentralizados
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
        </div>

        {/* Botones de conexión */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conecta tu Wallet
          </h3>
          
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
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
  )
}

export default WalletConnect
