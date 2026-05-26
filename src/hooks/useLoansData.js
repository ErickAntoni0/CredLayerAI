import { useQuery } from '@tanstack/react-query'

const fallbackLoans = {
  metrics: {
    activePrincipal: 12500,
    activePrincipalFormatted: '$12,500 USDC',
    averageRate: '4.3% APR',
    fundedLoans: 28,
    supporters: 18
  },
  availableLoans: [
    {
      id: 'loan-fallback-1',
      borrower: '0x61a2...c9b4',
      amount: '450.00',
      currency: 'USDC',
      durationDays: 45,
      purpose: 'Compra de insumos para taller textil',
      interestRate: '4.5%',
      funded: 72,
      supporters: 9,
      riskLevel: 'Baja',
      postedAt: '2024-10-12T18:32:00Z'
    },
    {
      id: 'loan-fallback-2',
      borrower: '0xe54d...9f23',
      amount: '1,200.00',
      currency: 'USDC',
      durationDays: 90,
      purpose: 'Equipo para estudio creativo',
      interestRate: '5.2%',
      funded: 54,
      supporters: 14,
      riskLevel: 'Media',
      postedAt: '2024-10-08T11:05:00Z'
    },
    {
      id: 'loan-fallback-3',
      borrower: '0x9f3b...d771',
      amount: '320.00',
      currency: 'USDC',
      durationDays: 30,
      purpose: 'Marketing para colectivo musical',
      interestRate: '3.8%',
      funded: 88,
      supporters: 6,
      riskLevel: 'Baja',
      postedAt: '2024-10-20T14:12:00Z'
    }
  ],
  myLoans: [
    {
      id: 'my-loan-1',
      amount: '600.00',
      currency: 'USDC',
      durationDays: 60,
      purpose: 'Community Project',
      status: 'active',
      statusLabel: 'Daily Payments',
      remainingDays: 22,
      nextPayment: '125.00 USDC',
      nextPaymentDate: '2024-11-15T05:00:00Z',
      reputationImpact: '+12 pts'
    },
    {
      id: 'my-loan-2',
      amount: '300.00',
      currency: 'USDC',
      durationDays: 30,
      purpose: 'Community Project',
      status: 'repaid',
      statusLabel: 'Completed',
      remainingDays: 0,
      nextPayment: '0.00 USDC',
      nextPaymentDate: null,
      reputationImpact: '+20 pts'
    }
  ],
  lastSync: null,
  source: 'fallback'
}

const hydrateLoansResponse = (payload = {}) => {
  const metrics = payload.metrics || {}

  return {
    metrics: {
      activePrincipal: metrics.activePrincipal ?? fallbackLoans.metrics.activePrincipal,
      activePrincipalFormatted: metrics.activePrincipalFormatted ?? fallbackLoans.metrics.activePrincipalFormatted,
      averageRate: metrics.averageRate ?? fallbackLoans.metrics.averageRate,
      fundedLoans: metrics.fundedLoans ?? fallbackLoans.metrics.fundedLoans,
      supporters: metrics.supporters ?? fallbackLoans.metrics.supporters
    },
    availableLoans: Array.isArray(payload.availableLoans) && payload.availableLoans.length > 0
      ? payload.availableLoans
      : fallbackLoans.availableLoans,
    myLoans: Array.isArray(payload.myLoans)
      ? (payload.myLoans.length > 0 ? payload.myLoans : fallbackLoans.myLoans)
      : fallbackLoans.myLoans,
    lastSync: payload.lastSync || null,
    source: payload.source || 'api'
  }
}

export const useLoansData = (address) => {
  return useQuery({
    queryKey: ['loans', address],
    enabled: true,
    queryFn: async () => {
      const endpoint = address ? `/api/loans?address=${address}` : '/api/loans'

      try {
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`API loans respondió ${response.status}`)
        }

        const data = await response.json()
        return hydrateLoansResponse({ ...data, source: 'api' })
      } catch (error) {
        console.warn('[useLoansData] usando datos fallback:', error.message)
        return { ...fallbackLoans, error: error.message }
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false
  })
}


