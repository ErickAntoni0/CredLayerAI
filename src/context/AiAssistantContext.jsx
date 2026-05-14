import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AiAssistantContext = createContext({
  pageIntent: 'general',
  pageContext: {},
  setPageIntent: () => {},
  updatePageContext: () => {}
})

export function AiAssistantProvider({ children }) {
  const [pageIntent, setPageIntent] = useState('general')
  const [pageContext, setPageContext] = useState({})

  const updatePageContext = useCallback((data, options = {}) => {
    if (options.replace) {
      setPageContext(data || {})
      return
    }

    setPageContext(prev => ({ ...prev, ...(data || {}) }))
  }, [])

  const value = useMemo(
    () => ({ pageIntent, pageContext, setPageIntent, updatePageContext }),
    [pageIntent, pageContext, updatePageContext]
  )

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  )
}

export function useAiAssistantContext() {
  return useContext(AiAssistantContext)
}


