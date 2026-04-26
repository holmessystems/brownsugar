import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global.fetch as a default no-op to prevent real network calls
// (CartContext fetches /api/admin-settings on mount)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
