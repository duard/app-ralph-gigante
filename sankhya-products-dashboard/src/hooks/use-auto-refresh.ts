import { useCallback, useEffect, useRef, useState } from 'react'

interface AutoRefreshOptions {
  enabled?: boolean
  interval?: number // in milliseconds
  onRefresh: () => void | Promise<void>
}

interface AutoRefreshReturn {
  isEnabled: boolean
  toggleAutoRefresh: () => void
  refreshNow: () => void
  timeUntilNextRefresh: number
}

export function useAutoRefresh({
  enabled = true,
  interval = 5 * 60 * 1000, // 5 minutes default
  onRefresh
}: AutoRefreshOptions): AutoRefreshReturn {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(Date.now())
  const isEnabledRef = useRef<boolean>(enabled)

  // Calculate time until next refresh
  const getTimeUntilNextRefresh = useCallback(() => {
    if (!isEnabledRef.current) return 0
    const elapsed = Date.now() - lastRefreshRef.current
    return Math.max(0, interval - elapsed)
  }, [interval])

  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(getTimeUntilNextRefresh())

  // Update countdown every second
  useEffect(() => {
    if (!isEnabledRef.current) return

    const countdownInterval = setInterval(() => {
      setTimeUntilNextRefresh(getTimeUntilNextRefresh())
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [getTimeUntilNextRefresh])

  const refreshNow = useCallback(async () => {
    try {
      await onRefresh()
      lastRefreshRef.current = Date.now()
      setTimeUntilNextRefresh(interval)
    } catch (error) {
      console.error('Error during auto refresh:', error)
    }
  }, [onRefresh, interval])

  const toggleAutoRefresh = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current

    if (isEnabledRef.current) {
      // Start auto refresh
      lastRefreshRef.current = Date.now()
      setTimeUntilNextRefresh(interval)

      intervalRef.current = setInterval(async () => {
        try {
          await onRefresh()
          lastRefreshRef.current = Date.now()
          setTimeUntilNextRefresh(interval)
        } catch (error) {
          console.error('Error during auto refresh:', error)
        }
      }, interval)
    } else {
      // Stop auto refresh
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setTimeUntilNextRefresh(0)
    }
  }, [onRefresh, interval])

  // Initial setup
  useEffect(() => {
    isEnabledRef.current = enabled

    if (enabled) {
      lastRefreshRef.current = Date.now()
      setTimeUntilNextRefresh(interval)

      intervalRef.current = setInterval(async () => {
        try {
          await onRefresh()
          lastRefreshRef.current = Date.now()
          setTimeUntilNextRefresh(interval)
        } catch (error) {
          console.error('Error during auto refresh:', error)
        }
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, onRefresh])

  return {
    isEnabled: isEnabledRef.current,
    toggleAutoRefresh,
    refreshNow,
    timeUntilNextRefresh
  }
}

// Hook specifically for dashboard metrics auto-refresh
export function useDashboardAutoRefresh(onRefresh: () => void | Promise<void>) {
  return useAutoRefresh({
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes
    onRefresh
  })
}