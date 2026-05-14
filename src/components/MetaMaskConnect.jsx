import React from 'react';

const MetaMaskConnect = () => {
  const connectMetaMask = async () => {
    // Verificar si MetaMask está instalado
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.info('MetaMask detectado, solicitando conexión...');
        
        // Solicitar acceso a las cuentas
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.info('Cuentas conectadas:', accounts);
        
        if (accounts.length > 0) {
          alert(`¡MetaMask conectado exitosamente!\nCuenta: ${accounts[0]}`);
          
          // Guardar en localStorage para persistencia
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', accounts[0]);
          
          // Recargar la página
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al conectar MetaMask:', error);
        
        if (error.code === 4001) {
          alert('Conexión cancelada por el usuario');
        } else {
          alert('Error al conectar con MetaMask: ' + error.message);
        }
      }
    } else {
      alert('MetaMask no está instalado.\n\nPor favor:\n1. Instala MetaMask desde https://metamask.io\n2. Recarga esta página\n3. Intenta conectar nuevamente');
    }
  };

  const checkConnection = () => {
    const isConnected = localStorage.getItem('walletConnected') === 'true';
    const address = localStorage.getItem('walletAddress');
    
    if (isConnected && address) {
      return (
        <div className="main-card">
          <div className="logo">
            <span className="logo-text">✓</span>
          </div>
          
          <h1 className="title">
            ¡Conectado! <span className="title-highlight">MX</span>
          </h1>
          
          <p className="subtitle">
            MetaMask conectado exitosamente<br />
            <strong>{address.slice(0, 6)}...{address.slice(-4)}</strong>
          </p>
          
          <button 
            onClick={() => {
              localStorage.removeItem('walletConnected');
              localStorage.removeItem('walletAddress');
              window.location.reload();
            }}
            className="button"
            style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}
          >
            🔌 Desconectar Wallet
          </button>
          
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
          
          <div className="status">
            <div className="status-dot"></div>
            <span className="status-text">MetaMask Conectado</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="main-card">
        <div className="logo">
          <span className="logo-text">M</span>
        </div>
        
        <h1 className="title">
          MicroPay <span className="title-highlight">MX</span>
        </h1>
        
        <p className="subtitle">
          Conecta tu MetaMask para continuar<br />
          Infraestructura financiera descentralizada
        </p>
        
        <button 
          onClick={connectMetaMask}
          className="button"
        >
          🦊 Conectar MetaMask
        </button>
        
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
        
        <div className="status">
          <div className="status-dot"></div>
          <span className="status-text">Esperando Conexión</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {checkConnection()}
    </div>
  );
};

export default MetaMaskConnect;
