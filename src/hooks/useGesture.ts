import { useRef, useCallback, useState } from 'react'

export interface GestureEvents {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
}

export interface GestureOptions {
  threshold?: number
  longPressTime?: number
}

export function useGesture(
  events: GestureEvents,
  options: GestureOptions = {}
) {
  const {
    threshold = 50,
    longPressTime = 500,
  } = options

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    setIsLongPress(false)

    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current)
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true)
      events.onLongPress?.()
    }, longPressTime)
  }, [events, longPressTime])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = undefined
    }

    if (isLongPress) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const isSwipe = deltaTime < 300 && distance > threshold

    if (isSwipe) {
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

      // Determine swipe direction (roughly)
      if (Math.abs(angle) < 45) {
        // Right swipe
        events.onSwipeRight?.()
      } else if (Math.abs(angle - 180) < 45 || Math.abs(angle + 180) < 45) {
        // Left swipe
        events.onSwipeLeft?.()
      } else if (angle > 45 && angle < 135) {
        // Down swipe
        events.onSwipeDown?.()
      } else if (angle < -45 && angle > -135) {
        // Up swipe
        events.onSwipeUp?.()
      }
    } else if (distance < 10) {
      events.onTap?.()
    }
  }, [isLongPress, threshold, events])

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user is moving
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      setIsLongPress(false)
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  }
}
