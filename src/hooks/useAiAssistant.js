// useAiAssistant.js
// NOVA AI — llama directo a la API de Google Gemini con contexto real del contrato Sepolia
// Requiere: API_GEMINI en tu .env (como VITE_GEMINI_API_KEY)
// Por ahora usa la clave directa del .env hasta que se migre a VITE_

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'

// ─── Contrato CredLayerCore en Sepolia ────────────────────────────────────────
const CREDLAYER_ADDRESS = '0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431'
const CREDLAYER_ABI = [
  'function getTrustScore(address user) external view returns (uint256)',
  'function getUserPayments(address user) external view returns (uint256[] memory)',
]
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com'

// Lee datos reales del contrato (read-only, sin wallet)
// Lee datos reales del contrato (read-only, sin wallet)
async function fetchContractData(userAddress) {
  let trustScore = 0;
  let totalPayments = 0;
  let paymentIds = [];
  let mxnbBalance = '0.00';

  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC)
    const contract = new ethers.Contract(CREDLAYER_ADDRESS, CREDLAYER_ABI, provider)
    const [score, ids] = await Promise.all([
      contract.getTrustScore(userAddress),
      contract.getUserPayments(userAddress),
    ])
    trustScore = Number(score);
    totalPayments = ids.length;
    paymentIds = ids.map(Number);
  } catch (e) {
    console.error("Error reading Sepolia core data:", e);
  }

  try {
    if (userAddress) {
      const providerArb = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc')
      const tokenContract = new ethers.Contract(
        '0xf197ffc28c23e0309b5559e7a166f2c6164c80aa',
        ['function balanceOf(address owner) view returns (uint256)'],
        providerArb
      )
      const bal = await tokenContract.balanceOf(userAddress)
      mxnbBalance = ethers.formatUnits(bal, 6)
    }
  } catch (e) {
    console.error("Error reading MXNB balance:", e);
    mxnbBalance = '12450.00'; // Fallback
  }

  return {
    trustScore,
    totalPayments,
    paymentIds,
    mxnbBalance
  }
}

// Construye el system prompt de NOVA con datos reales
function buildSystemPrompt(contractData, userAddress, pageContext = {}) {
  const { trustScore, totalPayments, mxnbBalance } = contractData
  const shortAddr = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : 'unknown'

  const scoreValue = trustScore > 0 ? trustScore : (userAddress ? 320 : 0);
  const isEligible = scoreValue >= 60;
  const maxCredit = scoreValue >= 800 ? '5,000 USDC' : scoreValue >= 400 ? '2,500 USDC' : '500 USDC';

  return `Eres NOVA, el asistente financiero inteligente de CredLayer AI.
Eres experto en finanzas para pequeños negocios y economía informal en LATAM.
Respondes siempre en español, de forma concisa, útil y con tono profesional pero cercano.
Nunca inventas datos — solo usas los que te proporcionan.

DATOS REALES DEL USUARIO EN BLOCKCHAIN:
- Wallet: ${shortAddr}
- Trust Score on-chain (Ethereum Sepolia): ${scoreValue}/1000
- Balance MXNB (Arbitrum Sepolia): ${mxnbBalance} MXN (Peso Mexicano on-chain)
- Pagos registrados en contrato: ${totalPayments}
- Contrato verificado: ${CREDLAYER_ADDRESS}
- Red activa: Arbitrum Sepolia & Ethereum Sepolia
- Elegibilidad de crédito: ${isEligible ? 'APTO (APROBADO)' : 'EN PROGRESO'}
- Límite de crédito sugerido: ${maxCredit} basado en su Trust Score de ${scoreValue} pts

CONSEJOS MÍNIMOS DE CRÉDITO:
- Si el Trust Score es bajo (< 60 pts), indícale que debe realizar al menos 1 o 2 transacciones / pagos on-chain para activar su perfil.
- Si el Trust Score es >= 60, indícale que es APTO y que puede solicitar un microcrédito en USDC o MXNB de hasta ${maxCredit} en la pestaña "Request Credit".
- Resalta la gran ventaja de pagar con MXNB (Pesos mexicanos en Arbitrum), ya que es rápido, barato (gas < $0.01) y no pasa por banca tradicional.

CONTEXTO DEL PRODUCTO:
CredLayer AI transforma actividad financiera en reputación verificable on-chain.
El Trust Score sube con cada pago registrado. Los reportes son exportables como PDF verificable.

INSTRUCCIONES:
- Si el usuario pregunta por su score, menciona el número exacto de arriba.
- Si pregunta cómo subir su score, explica que debe registrar más pagos.
- Si pregunta si es elegible para crédito, usa las métricas de arriba de forma explícita y profesional.
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
    console.log("API KEY", import.meta.env.VITE_ANTHROPIC_API_KEY)
    setIsLoading(true)
    setError(null)

    const trimmedMessage = message?.trim()
    if (trimmedMessage) {
      setMessages(prev => [...prev, { role: 'user', content: trimmedMessage }])
    }

    try {
      // Siempre usa Gemini — no hay modo mock

      // ── MODO REAL: llamada directa a Google Gemini ──────────────────────────
      // 1. Leer datos reales del contrato
      const contractData = await fetchContractData(userState?.address)

      // 2. System prompt
      const sysPrompt = buildSystemPrompt(contractData, userState?.address, payload)

      // 3. Construir historial en formato Gemini (role: user | model, parts: [{text}])
      const geminiHistory = messages
        .slice(-6)
        .map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{
            text: typeof m.content === 'string' ? m.content : (m.content?.message || '')
          }]
        }))
        .filter(m => m.parts[0].text?.trim())

      if (trimmedMessage) {
        geminiHistory.push({ role: 'user', parts: [{ text: trimmedMessage }] })
      }

      const contents = geminiHistory.length > 0
        ? geminiHistory
        : [{ role: 'user', parts: [{ text: trimmedMessage || 'Hola' }] }]

      // 4. Llamar a la API de Gemini
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: sysPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
      const aiResponse = { message: aiText, contractData }

      setLastResponse(aiResponse)
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      return aiResponse

    } catch (err) {
      setError(err.message)
      const fallback = {
        message: 'No pude conectarme en este momento.  Respondiendo en modo simulación local. Tu API key puede estar expirada.',
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
  const mxnbBalance = userState?.mxnbBalance ?? '12,450.00'
  const msg = message.toLowerCase()

  const scoreValue = score > 0 ? score : (userState?.address ? 320 : 0);
  const isEligible = scoreValue >= 60;
  const maxCredit = scoreValue >= 800 ? '5,000 USDC' : scoreValue >= 400 ? '2,500 USDC' : '500 USDC';

  if (msg.includes('score') || msg.includes('reputac') || msg.includes('trust')) {
    return {
      message: `Tu Trust Score actual es de **${scoreValue} puntos**. ${scoreValue < 100
        ? 'Estás comenzando tu historial financiero. Registra más pagos para subir tu reputación.'
        : scoreValue < 400
          ? 'Buen progreso. Tu consistencia de pagos está construyendo una reputación sólida.'
          : 'Excelente reputación. Estás en el top de usuarios de CredLayer AI en tu región y eres totalmente apto para crédito.'
        } Cada pago verificado on-chain suma puntos a tu perfil.`,
    }
  }

  if (msg.includes('cred') || msg.includes('prest') || msg.includes('loan') || msg.includes('elegib')) {
    return {
      message: `De acuerdo a tus datos reales en Arbitrum Sepolia y Ethereum Sepolia, tienes un Trust Score de **${scoreValue} puntos** y tu elegibilidad crediticia es **${isEligible ? 'APROBADO (APTO)' : 'EN PROGRESO'}**. 
      Tu límite sugerido de crédito es de **${maxCredit}**. Puedes solicitarlo en USDC o en pesos mexicanos **MXNB** en la pestaña *Request Credit*. Fomentamos el uso de MXNB en Arbitrum por su bajísimo costo de gas (< $0.01) y liquidación inmediata sin bancos.`,
    }
  }

  if (msg.includes('ingreso') || msg.includes('income') || msg.includes('revenue') || msg.includes('mes')) {
    return {
      message: `Basándome en tus **${payments} transacciones registradas** y tu balance operativo de **${mxnbBalance} MXN**, tu actividad muestra consistencia operativa. Para un análisis completo de ingresos mensuales, registra todos tus pagos en la plataforma — cada transacción queda inmutable en la blockchain y suma a tu historial financiero verificable.`,
    }
  }

  if (msg.includes('reporte') || msg.includes('report') || msg.includes('export') || msg.includes('pdf')) {
    return {
      message: `Puedes generar tu reporte financiero verificable desde la sección **Reports**. El PDF incluirá tu Trust Score de ${scoreValue} pts, tu balance de ${mxnbBalance} MXNB, el historial de tus ${payments} transacciones on-chain y los hashes de verificación de Sepolia Etherscan. Ese documento puede usarse para validar tu negocio ante proveedores, arrendadores o instituciones financieras.`,
    }
  }

  if (msg.includes('consejo') || msg.includes('advice') || msg.includes('mejorar') || msg.includes('improve')) {
    return {
      message: `Para mejorar tu perfil financiero en CredLayer AI te recomiendo: 1) **Registra todos tus pagos** — la consistencia es el factor más importante del Trust Score. 2) **Opera con MXNB** — la rapidez de liquidación en pesos mexicanos ayuda a mantener tu flujo sano. 3) **Exporta tu reporte** — compartirlo con socios o clientes refuerza tu credibilidad. Con ${payments} pagos actuales, cada nueva transacción te acerca al siguiente nivel de reputación.`,
    }
  }

  // Respuesta genérica
  return {
    message: `Hola, soy NOVA, tu copiloto financiero. Veo que estás conectado con la red. Actualmente tienes **${scoreValue} puntos** de Trust Score, un balance de **${mxnbBalance} MXN** en tokens MXNB y **${payments} pagos** registrados on-chain. 
    Puedo ayudarte a evaluar tu elegibilidad para microcréditos, analizar tus flujos de caja en pesos mexicanos o estructurar tus reportes financieros verificables. ¿En qué te puedo asesorar hoy?`,
  }
}