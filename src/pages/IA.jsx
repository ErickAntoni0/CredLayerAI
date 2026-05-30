import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react'
import { Brain, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { useAiAssistant } from '../hooks/useAiAssistant'
import { useAccount } from 'wagmi'
import gsap from 'gsap'
import latamImg from '../assets/latam1.jpg'
import handsImg from '../assets/imageHands.webp'
import '../styles/ia.css'

const QUICK_ACTIONS = [
  { label: '¿Cuál es mi Trust Score?', message: '¿Cuál es mi Trust Score actual?' },
  { label: '¿Soy elegible para crédito?', message: '¿Soy elegible para un microcrédito?' },
  { label: 'Cómo subir mi score', message: '¿Cómo puedo mejorar mi Trust Score?' },
  { label: 'Analiza mis pagos', message: 'Analiza mis pagos y dime cómo va mi historial financiero' },
  { label: 'Ventajas de MXNB', message: '¿Cuáles son las ventajas de usar MXNB en Arbitrum?' },
]

function renderFormattedText(rawText) {
  const formatted = rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />
}

export default function IA() {
  const { address } = useAccount()
  const { messages, isLoading, error, ask, reset } = useAiAssistant('nova-advice')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Carousel slide state
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = [
    {
      tag: 'Web3 Reputation',
      title: 'Tu historial, tu colateral',
      desc: 'Calculamos perfiles financieros on-chain de forma descentralizada. Cumplir a tiempo eleva tu estatus.',
      img: handsImg,
    },
    {
      tag: 'Stablecoin MXNB',
      title: 'Pagos sin fronteras',
      desc: 'Soporte total en MXNB en la red Arbitrum Sepolia, habilitando transacciones instantáneas y eficientes.',
      img: latamImg,
    }
  ]

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // GSAP animations for initial page elements and new messages
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Stagger animate header and bento columns
      gsap.from('.ia-brain-icon-wrapper, .ia-title, .ia-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      })

      gsap.from('.ia-info-panel', {
        x: -25,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      })

      gsap.from('.ia-chat-panel', {
        x: 25,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Stagger animate incoming chat bubbles
  useLayoutEffect(() => {
    if (messages.length > 0) {
      // Target the last message bubble row
      gsap.from('.ia-message-row:last-child', {
        y: 15,
        opacity: 0,
        scale: 0.98,
        duration: 0.45,
        ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
      })
    }
  }, [messages.length])

  const handleSend = useCallback(async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isLoading) return
    setInput('')
    await ask({ message: trimmed, userState: { address } })
  }, [input, isLoading, ask, address])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ia-page-wrapper" ref={containerRef}>
      {/* Header */}
      <header className="ia-header">
        <div className="ia-brain-icon-wrapper">
          <Brain size={28} />
        </div>
        <h1 className="ia-title">NOVA AI</h1>
        <p className="ia-subtitle">
          Tu asistente financiero inteligente · Datos en vivo de blockchain
        </p>
      </header>

      {/* Main Bento Grid */}
      <div className="ia-main-grid">
        {/* Left Column: Info Bento Panel & Carousel */}
        <aside className="ia-info-panel">
          <div>
            <h2>Nova Financial Guide</h2>
            <p style={{ marginTop: '8px' }}>
              Pregúntale a NOVA sobre tu elegibilidad para préstamos, tu score de reputación crediticia y el uso de la stablecoin MXNB.
            </p>
          </div>

          {/* Local Assets Carousel */}
          <div className="ia-carousel-container">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`ia-carousel-slide${index === activeSlide ? ' active' : ''}`}
                style={{ backgroundImage: `url(${slide.img})` }}
              >
                <div className="ia-slide-content">
                  <span className="ia-slide-tag">{slide.tag}</span>
                  <h3 className="ia-slide-title">{slide.title}</h3>
                  <p className="ia-slide-desc">{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicator Dots */}
          <div className="ia-carousel-dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`ia-dot${index === activeSlide ? ' active' : ''}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </aside>

        {/* Right Column: Chat Console */}
        <main className="ia-chat-panel">
          {/* Quick Actions */}
          <div className="ia-quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                className="ia-quick-btn"
                onClick={() => handleSend(action.message)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={reset}
              className="ia-reset-btn"
              title="Reset conversation"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Messages viewport */}
          <div className="ia-messages-viewport">
            {messages.length === 0 && (
              <div className="ia-empty-state">
                <Sparkles size={24} style={{ color: '#0a0a0a' }} />
                <p>
                  Hola, soy NOVA. Pregúntame sobre tu Trust Score,<br />
                  elegibilidad de crédito o finanzas en blockchain.
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              const text = typeof msg.content === 'string' ? msg.content : msg.content?.message ?? ''
              return (
                <div key={i} className={`ia-message-row ${isUser ? 'user' : 'nova'}`}>
                  <div className={`ia-bubble ${isUser ? 'ia-msg--user' : 'ia-msg--nova'}`}>
                    {!isUser && (
                      <div className="ia-bubble-header">NOVA AI</div>
                    )}
                    {renderFormattedText(text)}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="ia-loader-row">
                <div className="ia-loader-bubble">
                  <Loader2 size={13} className="ia-spinner" />
                  NOVA está formulando una respuesta...
                </div>
              </div>
            )}

            {error && (
              <div className="ia-error-banner">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input field block */}
          <div className="ia-input-container">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pregunta a NOVA..."
              disabled={isLoading}
              className="ia-input-field"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="ia-send-btn"
            >
              {isLoading ? <Loader2 size={16} className="ia-spinner" /> : <Send size={16} />}
            </button>
          </div>
        </main>
      </div>

      {/* Connected address footer */}
      {address && (
        <p className="ia-connected-status">
          Conectado · {address.slice(0, 6)}...{address.slice(-4)} · Datos en vivo de Sepolia &amp; Arbitrum
        </p>
      )}
    </div>
  )
}
