import React from 'react';

/**
 * Performance monitoring utilities for tracking debounce effectiveness
 */

interface DebounceMetrics {
  totalCalls: number;
  executedCalls: number;
  cancelledCalls: number;
  averageWaitTime: number;
  maxWaitTime: number;
  minWaitTime: number;
}

class DebounceMonitor {
  private metrics = new Map<string, DebounceMetrics>();
  private callTimes = new Map<string, number[]>();

  recordCall(debounceId: string): void {
    const metrics = this.getMetrics(debounceId);
    metrics.totalCalls++;

    const callTimes = this.callTimes.get(debounceId) || [];
    callTimes.push(Date.now());
    this.callTimes.set(debounceId, callTimes);
  }

  recordExecution(debounceId: string): void {
    const metrics = this.getMetrics(debounceId);
    metrics.executedCalls++;

    const callTimes = this.callTimes.get(debounceId) || [];
    if (callTimes.length > 0) {
      const waitTime = Date.now() - callTimes.shift()!;
      metrics.averageWaitTime =
        (metrics.averageWaitTime * (metrics.executedCalls - 1) + waitTime) / metrics.executedCalls;
      metrics.maxWaitTime = Math.max(metrics.maxWaitTime, waitTime);
      metrics.minWaitTime =
        metrics.minWaitTime === 0 ? waitTime : Math.min(metrics.minWaitTime, waitTime);
    }
  }

  recordCancellation(debounceId: string): void {
    const metrics = this.getMetrics(debounceId);
    metrics.cancelledCalls++;

    const callTimes = this.callTimes.get(debounceId) || [];
    if (callTimes.length > 0) {
      callTimes.shift(); // Remove the cancelled call
    }
  }

  getMetrics(debounceId: string): DebounceMetrics {
    if (!this.metrics.has(debounceId)) {
      this.metrics.set(debounceId, {
        totalCalls: 0,
        executedCalls: 0,
        cancelledCalls: 0,
        averageWaitTime: 0,
        maxWaitTime: 0,
        minWaitTime: 0,
      });
    }
    return this.metrics.get(debounceId)!;
  }

  getEfficiency(debounceId: string): number {
    const metrics = this.getMetrics(debounceId);
    return metrics.totalCalls > 0 ? metrics.executedCalls / metrics.totalCalls : 0;
  }

  getAllMetrics(): Record<string, DebounceMetrics> {
    const result: Record<string, DebounceMetrics> = {};
    for (const [id, metrics] of this.metrics.entries()) {
      result[id] = { ...metrics };
    }
    return result;
  }

  reset(debounceId?: string): void {
    if (debounceId) {
      this.metrics.delete(debounceId);
      this.callTimes.delete(debounceId);
    } else {
      this.metrics.clear();
      this.callTimes.clear();
    }
  }

  // Log metrics for debugging (only in development)
  logMetrics(debounceId?: string): void {
    if (process.env.NODE_ENV !== 'development') return;

    if (debounceId) {
      const metrics = this.getMetrics(debounceId);
      const efficiency = this.getEfficiency(debounceId);
      console.log(`[DebounceMonitor] ${debounceId}:`, {
        ...metrics,
        efficiency: `${(efficiency * 100).toFixed(1)}%`,
      });
    } else {
      console.log('[DebounceMonitor] All metrics:', this.getAllMetrics());
    }
  }
}

// Global instance
export const debounceMonitor = new DebounceMonitor();

/**
 * Hook to track debounce performance
 */
export function useDebounceTracking(debounceId: string) {
  const startTimeRef = React.useRef<number>(0);
  const callCountRef = React.useRef<number>(0);

  const trackCall = React.useCallback(() => {
    callCountRef.current++;
    startTimeRef.current = Date.now();
    debounceMonitor.recordCall(debounceId);
  }, [debounceId]);

  const trackExecution = React.useCallback(() => {
    if (startTimeRef.current) {
      debounceMonitor.recordExecution(debounceId);
    }
  }, [debounceId]);

  const trackCancellation = React.useCallback(() => {
    callCountRef.current = 0;
    debounceMonitor.recordCancellation(debounceId);
  }, [debounceId]);

  return {
    trackCall,
    trackExecution,
    trackCancellation,
    getMetrics: () => debounceMonitor.getMetrics(debounceId),
    getEfficiency: () => debounceMonitor.getEfficiency(debounceId),
  };
}

/**
 * Performance analysis utilities
 */
export const analyzeDebouncePerformance = () => {
  const allMetrics = debounceMonitor.getAllMetrics();
  const analysis = {
    totalDebouncedFunctions: Object.keys(allMetrics).length,
    averageEfficiency: 0,
    worstPerforming: { id: '', efficiency: 1 },
    bestPerforming: { id: '', efficiency: 0 },
    recommendations: [] as string[],
  };

  const efficiencies: number[] = [];

  for (const [id, metrics] of Object.entries(allMetrics)) {
    const efficiency = metrics.totalCalls > 0 ? metrics.executedCalls / metrics.totalCalls : 0;
    efficiencies.push(efficiency);

    if (efficiency < analysis.worstPerforming.efficiency) {
      analysis.worstPerforming = { id, efficiency };
    }

    if (efficiency > analysis.bestPerforming.efficiency) {
      analysis.bestPerforming = { id, efficiency };
    }

    // Generate recommendations
    if (efficiency < 0.3) {
      analysis.recommendations.push(
        `${id}: Very low efficiency (${(efficiency * 100).toFixed(1)}%). Consider increasing debounce delay.`
      );
    } else if (efficiency > 0.9) {
      analysis.recommendations.push(
        `${id}: High efficiency (${(efficiency * 100).toFixed(1)}%). Could potentially reduce debounce delay.`
      );
    }

    if (metrics.maxWaitTime > 2000) {
      analysis.recommendations.push(
        `${id}: Long maximum wait time (${metrics.maxWaitTime}ms). Consider adding maxWait option.`
      );
    }
  }

  analysis.averageEfficiency =
    efficiencies.length > 0
      ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
      : 0;

  return analysis;
};

export type { DebounceMetrics };
