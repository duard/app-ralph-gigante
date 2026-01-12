import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false by default when matchMedia returns false', () => {
    const mockMatchMedia = vi.mocked(window.matchMedia);
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia returns true', () => {
    // Mock window.innerWidth to be less than breakpoint
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const mockMatchMedia = vi.mocked(window.matchMedia);
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('sets up event listeners correctly', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    const mockMatchMedia = vi.mocked(window.matchMedia);
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    });

    renderHook(() => useIsMobile());

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    const mockMatchMedia = vi.mocked(window.matchMedia);
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
