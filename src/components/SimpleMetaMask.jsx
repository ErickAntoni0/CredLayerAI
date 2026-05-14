import React, { useState, useEffect } from 'react';

const SimpleMetaMask = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar estado de conexión desde localStorage
    const storedConnection = localStorage.getItem('walletConnected');
    const storedAccount = localStorage.getItem('walletAddress');
    if (storedConnection === 'true' && storedAccount) {
      setIsConnected(true);
      setAccount(storedAccount);
    }

    // Escuchar cambios en la cuenta de MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', accounts[0]);
        } else {
          disconnectWallet();
        }
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.info('Cuentas:', accounts);
        alert(`¡Conectado! Cuenta: ${accounts[0]}`);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
        
        // Recargar la página para mostrar el dashboard
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        alert('Error al conectar con MetaMask: ' + err.message);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    alert('Wallet desconectada.');
    window.location.reload(); // Recargar para limpiar el estado
  };

  return (
    <div className="container">
      <div className="main-card">
        {/* Logo */}
        <div className="logo">
          <span className="logo-text">M</span>
        </div>
        
        {/* Título */}
        <h1 className="title">
          MicroPay <span className="title-highlight">MX</span>
        </h1>
        
        {/* Subtítulo */}
        <p className="subtitle">
          {isConnected 
            ? `¡Conectado! Tu dirección: ${account?.slice(0, 6)}...${account?.slice(-4)}`
            : 'Conecta tu MetaMask para continuar'}
        </p>
        
        {/* Botón de MetaMask */}
        {!isConnected ? (
          <button 
            onClick={connectMetaMask}
            className="button"
            disabled={isConnecting}
          >
            {isConnecting ? 'Conectando...' : '🦊 Conectar MetaMask'}
          </button>
        ) : (
          <button 
            onClick={disconnectWallet}
            className="button"
          >
            🔌 Desconectar Wallet
          </button>
        )}

        {error && (
          <p className="error-message">
            Error: {error}
          </p>
        )}
        
        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">$15,000</div>
            <div className="stat-label">USD Premios</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">7</div>
            <div className="stat-label">Tracks</div>
          </div>
        </div>
        
        {/* Estado */}
        <div className="status">
          {isConnected ? (
            <>
              <div className="status-dot"></div>
              <span className="status-text">MetaMask Conectado</span>
            </>
          ) : (
            <>
              <div className="status-dot"></div>
              <span className="status-text">Esperando Conexión</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMetaMask;
