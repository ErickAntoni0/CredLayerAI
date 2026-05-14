import React, { useState, useCallback } from 'react'

function MembershipLanding() {
  const [loadError, setLoadError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const src = '/membership/index3.html'

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setLoadError(true)
  }, [])

  return (
    <div style={{position:'fixed', inset:0, background:'#0b0b0b'}}>
      
      {!loaded && !loadError && (
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff'}}>
          <div style={{textAlign:'center', opacity:0.8}}>
            <div style={{fontSize:18, marginBottom:8}}>Cargando landing de Membership…</div>
            <div style={{fontSize:12}}>Si tarda demasiado, abre directamente la vista previa:</div>
            <a href={src} target="_blank" rel="noreferrer" style={{color:'#6ee7b7'}}>Abrir /membership/index3.html</a>
          </div>
        </div>
      )}
      {loadError && (
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:18, marginBottom:8}}>No se pudo cargar el HTML embebido.</div>
            <a href={src} target="_blank" rel="noreferrer" style={{color:'#60a5fa'}}>Abrir en nueva pestaña</a>
          </div>
        </div>
      )}
      <iframe
        title="Membership Landing"
        src={src}
        onLoad={handleLoad}
        onError={handleError}
        style={{border:'none', width:'100%', height:'100%'}}
      />
    </div>
  )
}

export default MembershipLanding


