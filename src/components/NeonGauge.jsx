import React from 'react';
import '../styles/neon-gauge.css';

const NeonGauge = ({ score = 0, label = "Trust Score", size = 120 }) => {
  return (
    <div className="neon-gauge-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div 
        className="neon-gauge" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      >
        <div className="inner" style={{ width: `${size * 0.75}px`, height: `${size * 0.75}px` }}>
          <span>{score}</span>
          <span style={{ fontSize: '0.5em', opacity: 0.7 }}>pts</span>
        </div>
      </div>
      {label && <span style={{ color: '#00ffea', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>}
    </div>
  );
};

export default NeonGauge;
