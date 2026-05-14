import { useEffect, useRef } from 'react'

export const useCursorGlow = () => {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const handlePointerMove = (event) => {
      const rect = node.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      node.style.setProperty('--pointer-x', `${x}%`)
      node.style.setProperty('--pointer-y', `${y}%`)
    }

    const handlePointerLeave = () => {
      node.style.setProperty('--pointer-x', '50%')
      node.style.setProperty('--pointer-y', '20%')
    }

    node.addEventListener('pointermove', handlePointerMove)
    node.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      node.removeEventListener('pointermove', handlePointerMove)
      node.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return ref
}

export default useCursorGlow


