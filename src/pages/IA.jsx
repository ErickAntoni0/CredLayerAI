import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useAiAssistant } from '../hooks/useAiAssistant';
import { useAccount } from 'wagmi';

const QUICK_ACTIONS = [
  { label: '¿Cuál es mi Trust Score?', message: '¿Cuál es mi Trust Score actual?' },
  { label: '¿Soy elegible para crédito?', message: '¿Soy elegible para un microcrédito?' },
  { label: 'Cómo subir mi score', message: '¿Cómo puedo mejorar mi Trust Score?' },
  { label: 'Analiza mis pagos', message: 'Analiza mis pagos y dime cómo va mi historial financiero' },
  { label: 'Ventajas de MXNB', message: '¿Cuáles son las ventajas de usar MXNB en Arbitrum?' },
];

function renderFormattedText(rawText) {
  const formatted = rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export default function IA() {
  const { address } = useAccount();
  const { messages, isLoading, error, ask, reset } = useAiAssistant('nova-advice');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await ask({ message: trimmed, userState: { address } });
  }, [input, isLoading, ask, address]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #0a0a0f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '600px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 0 40px rgba(99,102,241,0.4)',
          marginBottom: '16px',
        }}>
          <Brain size={32} color="white" />
        </div>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 0 8px' }}>NOVA AI</h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
          Tu asistente financiero inteligente · Datos reales de blockchain
        </p>
      </div>

      {/* Chat container */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        minHeight: '520px',
      }}>
        {/* Quick actions */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.message)}
              disabled={isLoading}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(99,102,241,0.4)',
                background: 'rgba(99,102,241,0.1)',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!isLoading) { e.target.style.background = 'rgba(99,102,241,0.25)'; e.target.style.color = 'white'; } }}
              onMouseLeave={e => { e.target.style.background = 'rgba(99,102,241,0.1)'; e.target.style.color = '#a5b4fc'; }}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={reset}
            title="Limpiar conversación"
            style={{
              marginLeft: 'auto',
              padding: '6px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#9ca3af'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '24px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '300px',
          maxHeight: '480px',
        }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#4b5563',
              textAlign: 'center',
              padding: '40px 0',
            }}>
              <Sparkles size={28} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Hola, soy NOVA. Pregúntame sobre tu Trust Score,<br />
                elegibilidad de crédito o finanzas en blockchain.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const text = typeof msg.content === 'string' ? msg.content : msg.content?.message ?? '';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '12px 16px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '0.9rem',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                }}>
                  {!isUser && (
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#818cf8',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>NOVA AI</div>
                  )}
                  {renderFormattedText(text)}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#9ca3af',
                fontSize: '0.85rem',
              }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                NOVA está pensando...
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu pregunta a NOVA..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading || !input.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 15px rgba(99,102,241,0.4)',
            }}
          >
            {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {/* Status footer */}
      {address && (
        <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '16px' }}>
          Conectado · {address.slice(0, 6)}...{address.slice(-4)} · Datos en vivo de Sepolia &amp; Arbitrum
        </p>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
