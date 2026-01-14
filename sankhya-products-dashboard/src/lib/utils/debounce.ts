import { useCallback, useRef, useEffect } from 'react';
import { debounceMonitor } from './performance-monitor';

/**
 * Enhanced debounced function with cancellation and immediate execution capabilities
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean; // Execute immediately on first call
    trailing?: boolean; // Execute after delay (default: true)
    maxWait?: number; // Maximum time to wait before execution
  } = {}
): {
  debounced: T;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined);
  const { leading = false, trailing = true, maxWait } = options;

  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

      return (
        lastCallTimeRef.current === 0 ||
        timeSinceLastCall >= delay ||
        timeSinceLastCall < 0 ||
        (maxWait && timeSinceLastInvoke >= maxWait)
      );
    },
    [delay, maxWait]
  );

  const invokeFunc = useCallback(
    (time: number, args?: Parameters<T>) => {
      lastInvokeTimeRef.current = time;
      debounceMonitor.recordExecution('useDebounce');
      return callback(...(args || []));
    },
    [callback]
  );

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return invokeFunc(time, lastArgsRef.current);
    }
    if (!timeoutRef.current) return;

    const remainingWait = delay - (time - lastCallTimeRef.current);
    timeoutRef.current = setTimeout(timerExpired, remainingWait);
  }, [shouldInvoke, invokeFunc, delay]);

  const maxTimerExpired = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    invokeFunc(Date.now(), lastArgsRef.current);
  }, [invokeFunc]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      // Track call for performance monitoring
      debounceMonitor.recordCall('useDebounce');

      lastCallTimeRef.current = time;
      lastArgsRef.current = args;

      if (isInvoking) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }

        if (leading && lastInvokeTimeRef.current === 0) {
          lastInvokeTimeRef.current = time;
          debounceMonitor.recordExecution('useDebounce');
          return callback(...args);
        }
      }

      if (!timeoutRef.current && trailing) {
        timeoutRef.current = setTimeout(timerExpired, delay);
      }

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(maxTimerExpired, maxWait);
      }
    },
    [callback, delay, leading, trailing, maxWait, shouldInvoke, timerExpired, maxTimerExpired]
  );

  const cancel = useCallback(() => {
    // Track cancellation for performance monitoring
    if (timeoutRef.current || maxTimeoutRef.current) {
      debounceMonitor.recordCancellation('useDebounce');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastCallTimeRef.current = 0;
    lastInvokeTimeRef.current = 0;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    return invokeFunc(Date.now(), lastArgsRef.current);
  }, [invokeFunc]);

  const pending = useCallback(() => {
    return !!timeoutRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    debounced: debouncedCallback as T,
    cancel,
    flush,
    pending,
  };
}

/**
 * Enhanced debounce utility for non-hook usage with cancellation support
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): {
  debounced: T;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
} {
  let timeout: NodeJS.Timeout | null = null;
  let maxTimeout: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  const { leading = false, trailing = true, maxWait } = options;

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return invokeFunc(time);
    }
    if (!timeout) return;

    const remainingWait = wait - (time - lastCallTime);
    timeout = setTimeout(timerExpired, remainingWait);
  };

  const maxTimerExpired = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    invokeFunc(Date.now(), lastArgs);
  };

  const invokeFunc = (time: number, args?: Parameters<T>) => {
    lastInvokeTime = time;
    return func(...(args || []));
  };

  const debounced = ((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTime = time;
    lastArgs = args;

    if (isInvoking) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (maxTimeout) {
        clearTimeout(maxTimeout);
        maxTimeout = null;
      }

      if (leading && lastInvokeTime === 0) {
        lastInvokeTime = time;
        return func(...args);
      }
    }

    if (!timeout && trailing) {
      timeout = setTimeout(timerExpired, wait);
    }

    if (maxWait && !maxTimeout) {
      maxTimeout = setTimeout(maxTimerExpired, maxWait);
    }
  }) as T;

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = null;
    }
    lastCallTime = 0;
    lastInvokeTime = 0;
  };

  const flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = null;
    }
    return invokeFunc(Date.now(), lastArgs);
  };

  const pending = () => !!timeout;

  return { debounced, cancel, flush, pending };
}

/**
 * Legacy compatibility function for simple debounce usage
 */
export function simpleDebounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
