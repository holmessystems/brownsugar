import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// We need to control import.meta.env BEFORE the hook module is loaded,
// so we use dynamic import with vi.stubEnv / vi.unstubAllEnvs per test.

describe('useSquarePayment', () => {
  let useSquarePayment;

  beforeEach(() => {
    vi.useFakeTimers();
    // Clean up window.Square between tests
    delete window.Square;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadHook() {
    const mod = await import('../hooks/useSquarePayment.js');
    useSquarePayment = mod.default;
  }

  // Requirement 9.1: isOpen=false returns cardReady=false and does not initialize SDK
  describe('when isOpen is false', () => {
    it('returns cardReady=false and does not initialize the SDK', async () => {
      vi.stubEnv('VITE_SQUARE_APP_ID', 'test-app-id');
      vi.stubEnv('VITE_SQUARE_LOCATION_ID', 'test-location-id');
      await loadHook();

      const paymentsSpy = vi.fn();
      window.Square = { payments: paymentsSpy };

      const { result } = renderHook(() => useSquarePayment(false));

      // Advance past the 400ms init delay
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.cardReady).toBe(false);
      expect(paymentsSpy).not.toHaveBeenCalled();
    });
  });

  // Requirement 9.2: isOpen=true without window.Square sets error about SDK not loaded
  describe('when isOpen is true and Square SDK is not on window', () => {
    it('sets error indicating SDK is not loaded', async () => {
      vi.stubEnv('VITE_SQUARE_APP_ID', 'test-app-id');
      vi.stubEnv('VITE_SQUARE_LOCATION_ID', 'test-location-id');
      await loadHook();

      // window.Square is not set
      const { result } = renderHook(() => useSquarePayment(true));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.error).toMatch(/square sdk not loaded/i);
      expect(result.current.cardReady).toBe(false);
    });
  });

  // Requirement 9.3: isOpen=true without APP_ID sets error "Square App ID not configured"
  describe('when isOpen is true and APP_ID is not configured', () => {
    it('sets error "Square App ID not configured"', async () => {
      vi.stubEnv('VITE_SQUARE_APP_ID', '');
      vi.stubEnv('VITE_SQUARE_LOCATION_ID', 'test-location-id');
      await loadHook();

      const { result } = renderHook(() => useSquarePayment(true));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.error).toBe('Square App ID not configured');
    });

    it('sets error when APP_ID contains placeholder XXXX', async () => {
      vi.stubEnv('VITE_SQUARE_APP_ID', 'sandbox-sq0-XXXX');
      vi.stubEnv('VITE_SQUARE_LOCATION_ID', 'test-location-id');
      await loadHook();

      const { result } = renderHook(() => useSquarePayment(true));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.error).toBe('Square App ID not configured');
    });
  });

  // Requirement 9.4: tokenize throws "Card form not ready" when card form is not initialized
  describe('tokenize', () => {
    it('throws "Card form not ready" when card form is not initialized', async () => {
      vi.stubEnv('VITE_SQUARE_APP_ID', 'test-app-id');
      vi.stubEnv('VITE_SQUARE_LOCATION_ID', 'test-location-id');
      await loadHook();

      const { result } = renderHook(() => useSquarePayment(false));

      await expect(result.current.tokenize()).rejects.toThrow('Card form not ready');
    });
  });
});
