import React, { useEffect, useMemo, useState } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { useAiAssistant } from '../hooks/useAiAssistant'

const fallbackHighlights = (amount, tokenIn, tokenOut, slippage) => [
  {
    title: 'Ruta sugerida',
    description: `Operación estimada para ${amount || '0'} ${tokenIn} → ${tokenOut}.`,
    tag: 'Optimización'
  },
  {
    title: 'Gestión de riesgo',
    description: `Ajusta tu slippage a ~${slippage}% y confirma gas antes de enviar.`,
    tag: 'Riesgo'
  }
]

const AIInsightsPanel = ({ amount, tokenIn, tokenOut, slippage }) => {
  const { lastResponse, isLoading, error, ask } = useAiAssistant('swap-advice')
  const [highlights, setHighlights] = useState(() => fallbackHighlights(amount, tokenIn, tokenOut, slippage))

  const basePayload = useMemo(() => ({ amount, tokenIn, tokenOut, slippage }), [amount, tokenIn, tokenOut, slippage])

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(async () => {
      const data = await ask({ payload: basePayload, message: 'Analiza esta operación de swap.' })
      if (data && isMounted) {
        setHighlights(data.highlights || [])
      }
      if (!data && isMounted) {
        setHighlights(fallbackHighlights(amount, tokenIn, tokenOut, slippage))
      }
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [ask, basePayload, amount, tokenIn, tokenOut, slippage])

  const handleAction = async (action) => {
    const data = await ask({
      intent: action.intent,
      payload: { ...basePayload, ...(action.payload || {}) },
      message: action.label
    })
    if (data) {
      setHighlights(data.highlights || [])
    }
  }

  const actions = lastResponse?.actions || []

  return (
    <section className="membership-section">
      <div className="membership-section-card">
        <div className="membership-section-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="membership-feature-icon" style={{ width: 44, height: 44 }}>
              <Brain size={22} />
            </div>
            <div>
              <h2 className="membership-section-title" style={{ marginBottom: 0 }}>Asistente IA</h2>
              <p className="membership-section-subtitle" style={{ marginTop: '0.25rem' }}>
                Modelos heurísticos para swaps inteligentes y recomendaciones accionables.
              </p>
            </div>
          </div>
          {actions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {actions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className="status-chip status-chip--ghost"
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                >
                  <Sparkles size={14} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div style={{ marginBottom: '1rem', color: 'rgba(191,219,254,0.75)' }}>Analizando operación...</div>
        )}

        {error && (
          <div style={{ marginBottom: '1rem', color: 'rgba(248,113,113,0.85)' }}>
            {error} · mostrando recomendaciones base.
          </div>
        )}

        <div className="membership-list" style={{ gap: '1rem' }}>
          {highlights.map(item => (
            <div key={item.title} className="membership-list-item" style={{ alignItems: 'flex-start', gap: '1rem' }}>
              <div className="membership-feature-icon" style={{ width: 40, height: 40, flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--white-color)', fontWeight: 600 }}>{item.title}</span>
                  {item.tag && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                        background: 'rgba(94, 234, 212, 0.12)',
                        border: '1px solid rgba(94, 234, 212, 0.3)',
                        color: 'rgba(94, 234, 212, 0.8)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px'
                    }}
                  >
                    {item.tag}
                  </span>
                  )}
                </div>
                <p style={{ color: 'rgba(226,232,240,0.75)', lineHeight: 1.5 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AIInsightsPanel

