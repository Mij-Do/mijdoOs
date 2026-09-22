import { useEffect, useRef, useState } from 'react'

type WindowPosition = {
  x: number
  y: number
}

type PointerOffset = WindowPosition

export function useDraggableWindow(initialPosition: WindowPosition) {
  const [position, setPosition] = useState(() => ({
    x: Math.min(initialPosition.x, Math.max(8, window.innerWidth - 320)),
    y: initialPosition.y,
  }))
  const [isDragging, setIsDragging] = useState(false)
  const offsetRef = useRef<PointerOffset>({ x: 0, y: 0 })

  function startDragging(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return

    offsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    function moveWindow(event: PointerEvent) {
      setPosition({
        x: Math.max(0, event.clientX - offsetRef.current.x),
        y: Math.max(0, event.clientY - offsetRef.current.y),
      })
    }

    function stopDragging() {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', moveWindow)
    window.addEventListener('pointerup', stopDragging)

    return () => {
      window.removeEventListener('pointermove', moveWindow)
      window.removeEventListener('pointerup', stopDragging)
    }
  }, [isDragging])

  return { position, isDragging, startDragging }
}