import React from 'react';

const TestConnection = () => {
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        alert('¡MetaMask conectado exitosamente!');
        window.location.reload();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('Error al conectar con MetaMask: ' + error.message);
      }
    } else {
      alert('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
    }
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
          ¡CSS puro funcionando! 🎉<br />
          Infraestructura financiera descentralizada
        </p>
        
        {/* Botón de MetaMask */}
        <button 
          onClick={connectMetaMask}
          className="button"
        >
          🔗 Conectar MetaMask
        </button>
        
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
          <div className="status-dot"></div>
          <span className="status-text">Sistema Funcionando</span>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
