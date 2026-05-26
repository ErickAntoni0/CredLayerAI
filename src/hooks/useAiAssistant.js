// useAiAssistant.js
// NOVA AI — llama directo a la API de Anthropic con contexto real del contrato Sepolia
// Requiere: VITE_ANTHROPIC_API_KEY en tu .env

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'

// ─── Contrato CredLayerCore en Sepolia ────────────────────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const CREDLAYER_ABI = [
  'function getTrustScore(address user) external view returns (uint256)',
  'function getUserPayments(address user) external view returns (uint256[] memory)',
]
const SEPOLIA_RPC = 'https://rpc.sepolia.org'

// Lee datos reales del contrato (read-only, sin wallet)
async function fetchContractData(userAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC)
    const contract = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, provider)
    const [score, paymentIds] = await Promise.all([
      contract.getTrustScore(userAddress),
      contract.getUserPayments(userAddress),
    ])
    return {
      trustScore: Number(score),
      totalPayments: paymentIds.length,
      paymentIds: paymentIds.map(Number),
    }
  } catch {
    // Si falla la lectura (sin internet, RPC caído) devuelve datos vacíos
    return { trustScore: 0, totalPayments: 0, paymentIds: [] }
  }
}

// Construye el system prompt de NOVA con datos reales
function buildSystemPrompt(contractData, userAddress, pageContext = {}) {
  const { trustScore, totalPayments } = contractData
  const shortAddr = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : 'unknown'

  return `Eres NOVA, el asistente financiero inteligente de CredLayer AI.
Eres experto en finanzas para pequeños negocios y economía informal en LATAM.
Respondes siempre en español, de forma concisa, útil y con tono profesional pero cercano.
Nunca inventas datos — solo usas los que te proporcionan.

DATOS REALES DEL USUARIO EN BLOCKCHAIN (Sepolia Testnet):
- Wallet: ${shortAddr}
- Trust Score on-chain: ${trustScore}/1000
- Pagos registrados en contrato: ${totalPayments}
- Contrato verificado: ${CREDLAYER_ADDRESS}
${pageContext.network ? `- Red activa: ${pageContext.network}` : ''}
${pageContext.currentForm?.amount ? `- Pago en progreso: $${pageContext.currentForm.amount} USDC` : ''}

CONTEXTO DEL PRODUCTO:
CredLayer AI transforma actividad financiera en reputación verificable on-chain.
El Trust Score sube con cada pago registrado. Los reportes son exportables como PDF verificable.

INSTRUCCIONES:
- Si el usuario pregunta por su score, menciona el número exacto de arriba.
- Si pregunta cómo subir su score, explica que debe registrar más pagos.
- Si pregunta sobre sus transacciones, usa el número real (${totalPayments} pagos).
- Mantén respuestas cortas (máximo 3 párrafos).
- Puedes sugerir acciones concretas dentro de la plataforma.`
}

// ─── Hook principal ────────────────────────────────────────────────────────────
export const useAiAssistant = (defaultIntent = 'general') => {
  const [messages, setMessages] = useState([])
  const [lastResponse, setLastResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = useCallback(async ({
    intent = defaultIntent,
    payload = {},
    userState = {},
    message,
  } = {}) => {
    setIsLoading(true)
    setError(null)

    const trimmedMessage = message?.trim()
    if (trimmedMessage) {
      setMessages(prev => [...prev, { role: 'user', content: trimmedMessage }])
    }

    try {
      const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY
      const isPlaceholder = apiKey && (apiKey.includes('P3X6XJ3X3X') || apiKey.startsWith('YOUR_ANTHROPIC_KEY'));

      // ── MODO MOCK: si no hay API key o es un placeholder, responde con datos reales pero sin llamada ──
      if (!apiKey || isPlaceholder) {
        const mockReply = buildMockReply(trimmedMessage, userState)
        setLastResponse(mockReply)
        setMessages(prev => [...prev, { role: 'ai', content: mockReply }])
        setIsLoading(false)
        return mockReply
      }

      // ── MODO REAL: llamada directa a Anthropic ────────────────────────────────
      // 1. Leer datos reales del contrato
      const contractData = await fetchContractData(userState?.address)

      // 2. Construir historial de mensajes para la API
      const history = messages
        .slice(-6) // últimos 6 mensajes para no exceder contexto
        .map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }))

      if (trimmedMessage) {
        history.push({ role: 'user', content: trimmedMessage })
      }

      // 3. Llamar a la API de Anthropic
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          // Necesario para llamadas desde el navegador
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: buildSystemPrompt(contractData, userState?.address, payload),
          messages: history,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const aiText = data?.content?.[0]?.text || 'No response received.'
      const aiResponse = { message: aiText, contractData }

      setLastResponse(aiResponse)
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      return aiResponse

    } catch (err) {
      setError(err.message)
      const fallback = {
        message: 'No pude conectarme en este momento. Verifica tu API key en el archivo .env y vuelve a intentarlo.',
      }
      setMessages(prev => [...prev, { role: 'ai', content: fallback }])
      return null
    } finally {
      setIsLoading(false)
    }
  }, [defaultIntent, messages])

  const reset = useCallback(() => {
    setMessages([])
    setLastResponse(null)
    setError(null)
  }, [])

  return { messages, lastResponse, isLoading, error, ask, reset }
}

// ─── Mock inteligente (cuando no hay API key) ──────────────────────────────────
// Responde con datos reales del userState pero sin llamada externa.
// Perfecto para demos en vivo donde no quieres depender de internet.
function buildMockReply(message = '', userState = {}) {
  const score = userState?.reputationScore ?? userState?.trustScore ?? 0
  const payments = userState?.totalPayments ?? 0
  const msg = message.toLowerCase()

  if (msg.includes('score') || msg.includes('reputac') || msg.includes('trust')) {
    return {
      message: `Tu Trust Score actual es **${score} puntos**. ${score < 100
          ? 'Estás comenzando tu historial financiero. Registra más pagos para subir tu reputación.'
          : score < 300
            ? 'Buen progreso. Tu consistencia de pagos está construyendo una reputación sólida.'
            : 'Excelente reputación. Estás en el top de usuarios de CredLayer AI en tu región.'
        } Cada pago verificado on-chain suma puntos a tu perfil.`,
    }
  }

  if (msg.includes('ingreso') || msg.includes('income') || msg.includes('revenue') || msg.includes('mes')) {
    return {
      message: `Basándome en tus **${payments} transacciones registradas** en Sepolia, tu actividad muestra consistencia operativa. Para un análisis completo de ingresos mensuales, registra todos tus pagos en la plataforma — cada transacción queda inmutable en la blockchain y suma a tu historial financiero verificable.`,
    }
  }

  if (msg.includes('reporte') || msg.includes('report') || msg.includes('export') || msg.includes('pdf')) {
    return {
      message: `Puedes generar tu reporte financiero verificable desde la sección **Reports**. El PDF incluirá tu Trust Score de ${score} pts, el historial de tus ${payments} transacciones on-chain y los hashes de verificación de Sepolia Etherscan. Ese documento puede usarse para validar tu negocio ante proveedores, arrendadores o instituciones financieras.`,
    }
  }

  if (msg.includes('consejo') || msg.includes('advice') || msg.includes('mejorar') || msg.includes('improve')) {
    return {
      message: `Para mejorar tu perfil financiero en CredLayer AI te recomiendo: 1) **Registra todos tus pagos** — la consistencia es el factor más importante del Trust Score. 2) **Mantén actividad frecuente** — el sistema detecta patrones de operación continua. 3) **Exporta tu reporte** — compartirlo con socios o clientes refuerza tu credibilidad. Con ${payments} pagos actuales, cada nueva transacción te acerca al siguiente nivel de reputación.`,
    }
  }

  // Respuesta genérica
  return {
    message: `Soy NOVA, tu asistente financiero de CredLayer AI. Actualmente tienes **${score} puntos** de Trust Score y **${payments} pagos** registrados en la blockchain de Sepolia. Puedo ayudarte a analizar tus ingresos, entender tu reputación financiera o generar reportes verificables. ¿Qué te gustaría saber?`,
  }
}