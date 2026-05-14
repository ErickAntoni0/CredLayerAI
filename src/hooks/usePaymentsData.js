import { useQuery } from '@tanstack/react-query'

const fallbackResponse = {
  metrics: {
    totalVolumeUsd: 175,
    totalVolumeUsdFormatted: '$175.00',
    completedThisMonth: 12,
    successRate: 0.98,
    successRateFormatted: '98%'
  },
  history: [
    {
      id: 'fallback-1',
      to: '0x1234...5678',
      amount: '50.00',
      memo: 'Pago de prueba',
      status: 'completed',
      timestamp: '2024-01-15T12:00:00Z'
    },
    {
      id: 'fallback-2',
      to: '0x8765...4321',
      amount: '25.00',
      memo: 'Servicio',
      status: 'completed',
      timestamp: '2024-01-14T12:00:00Z'
    },
    {
      id: 'fallback-3',
      to: '0xabcd...efgh',
      amount: '100.00',
      memo: 'Préstamo',
      status: 'pending',
      timestamp: '2024-01-13T12:00:00Z'
    }
  ],
  lastSync: null,
  source: 'fallback'
}

const hydratePaymentsResponse = (payload = {}) => {
  const metrics = payload.metrics || {}
  return {
    metrics: {
      totalVolumeUsd: metrics.totalVolumeUsd ?? fallbackResponse.metrics.totalVolumeUsd,
      totalVolumeUsdFormatted: metrics.totalVolumeUsdFormatted ?? fallbackResponse.metrics.totalVolumeUsdFormatted,
      completedThisMonth: metrics.completedThisMonth ?? fallbackResponse.metrics.completedThisMonth,
      successRate: metrics.successRate ?? fallbackResponse.metrics.successRate,
      successRateFormatted: metrics.successRateFormatted ?? fallbackResponse.metrics.successRateFormatted
    },
    history: Array.isArray(payload.history) && payload.history.length > 0
      ? payload.history
      : fallbackResponse.history,
    lastSync: payload.lastSync || null,
    source: payload.source || 'api'
  }
}

export const usePaymentsData = (address) => {
  return useQuery({
    queryKey: ['payments', address],
    enabled: true,
    queryFn: async () => {
      const controller = new AbortController()
      const endpoint = address ? `/api/payments?address=${address}` : '/api/payments'

      try {
        const response = await fetch(endpoint, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`API payments respondió ${response.status}`)
        }

        const data = await response.json()
        return hydratePaymentsResponse({ ...data, source: 'api' })
      } catch (error) {
        console.warn('[usePaymentsData] usando datos fallback:', error.message)
        return { ...fallbackResponse, error: error.message }
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false
  })
}


