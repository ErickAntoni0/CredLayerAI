import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Brain, MessageCircle, Send, Loader2, X } from 'lucide-react'
import { useAiAssistant } from '../hooks/useAiAssistant'
import { useAiAssistantContext } from '../context/AiAssistantContext'

const QUICK_ACTIONS = {
  general: [
    { label: 'Overview CredLayer AI', intent: 'general', payload: { action: 'overview' } },
    { label: 'How to start', intent: 'general', payload: { action: 'getting-started' } }
  ],
  'nova-advice': [
    { label: 'Overview intelligence', intent: 'nova-advice', payload: { action: 'overview' } },
    { label: 'Full Flow', intent: 'nova-advice', payload: { action: 'flows' } },
    { label: 'DeFi Cases', intent: 'nova-advice', payload: { action: 'defi' } }
  ],
  'swap-advice': [
    { label: 'Analyze alternative route', intent: 'swap-advice', payload: { action: 'alt-route' } },
    { label: 'Recommended stablecoins', intent: 'swap-advice', payload: { action: 'stablecoins' } },
    { label: 'MEV Risk', intent: 'swap-advice', payload: { action: 'mev-risk' } }
  ],
  'payments-advice': [
    { label: 'Optimize fees', intent: 'payments-advice', payload: { action: 'optimize-fees' } },
    { label: 'Payments summary', intent: 'payments-advice', payload: { action: 'summary' } }
  ],
  'loans-advice': [
    { label: 'Best rate available', intent: 'loans-advice', payload: { action: 'best-rate' } },
    { label: 'Liquidation risk', intent: 'loans-advice', payload: { action: 'liquidation-risk' } }
  ],
  'profile-advice': [
    { label: 'Improve reputation', intent: 'profile-advice', payload: { action: 'reputation' } },
    { label: 'Configure ENS', intent: 'profile-advice', payload: { action: 'ens-setup' } }
  ],
  'community-advice': [
    { label: 'Recommended events', intent: 'community-advice', payload: { action: 'events' } },
    { label: 'Connect with leaders', intent: 'community-advice', payload: { action: 'leaders' } }
  ]
}

const STATUS_LABELS = {
  user: 'You',
  ai: 'NOVA AI'
}

function AIAssistantChat() {
  const { pageIntent, pageContext } = useAiAssistantContext()
  const { ask, messages, isLoading, error, reset } = useAiAssistant(pageIntent)
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
    }
  }, [isOpen])

  useEffect(() => {
    reset()
  }, [pageIntent, reset])

  const handleSend = useCallback(async () => {
    const trimmed = message.trim()
    if (!trimmed) return
    await ask({ message: trimmed, userState: pageContext })
    setMessage('')
  }, [message, ask, pageContext])

  const actions = useMemo(() => QUICK_ACTIONS[pageIntent] || QUICK_ACTIONS.general, [pageIntent])

  const handleQuickAction = useCallback((action) => {
    ask({ intent: action.intent, payload: action.payload, userState: pageContext, message: action.label })
  }, [ask, pageContext])

  return (
    <div className="ai-chat-container">
      <button
        type="button"
        className={`ai-chat-toggle ${isOpen ? 'ai-chat-toggle--active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={20} />}
        <span>AI Assistant</span>
      </button>

      {isOpen && (
        <div className="ai-chat-panel">
          <header className="ai-chat-header">
            <div className="ai-chat-heading">
              <span className="ai-chat-icon">
                <Brain size={18} />
              </span>
              <div>
                <h2>NOVA AI</h2>
                <p>Ask NOVA your questions about swaps, payments, loans and community.</p>
              </div>
            </div>
          </header>

          <div className="ai-chat-actions">
            {actions.map(action => (
              <button
                key={action.label}
                type="button"
                className="status-chip"
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <Brain size={20} />
                <span>Hello! I'm NOVA AI, how can I help you today? Describe the operation or doubt you have.</span>
              </div>
            )}

            {messages.map((item, idx) => (
              <div key={idx} className={`ai-chat-message ai-chat-message--${item.role}`}>
                <div className="ai-chat-meta">{STATUS_LABELS[item.role] || item.role}</div>
                <div className="ai-chat-bubble">
                  {typeof item.content === 'string' ? (
                    <p>{item.content}</p>
                  ) : (
                    <>
                      <p>{item.content?.message}</p>
                      {item.content?.highlights && (
                        <ul>
                          {item.content.highlights.map((highlight, highlightIdx) => (
                            <li key={highlightIdx}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-chat-loading">
                <Loader2 size={18} className="animate-spin" />
                Generating response...
              </div>
            )}

            {error && (
              <div className="ai-chat-error">
                An error occurred while contacting the assistant. Please try again.
              </div>
            )}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Write your question or action..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
            />
            <button type="button" onClick={handleSend} disabled={isLoading || !message.trim()}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistantChat


