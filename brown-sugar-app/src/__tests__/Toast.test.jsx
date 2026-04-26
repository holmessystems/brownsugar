import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import { useEffect } from 'react';

// Helper that triggers showToast inside the same CartProvider tree
function ToastSetter({ message }) {
  const { showToast } = useCart();
  useEffect(() => {
    if (message) showToast(message);
  }, [message, showToast]);
  return null;
}

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('renders with "show" CSS class when toast message is non-empty', async () => {
    const { container } = render(
      <CartProvider>
        <ToastSetter message="Item added!" />
        <Toast />
      </CartProvider>,
    );

    // Wait for useEffect to fire
    await act(async () => {});

    const toastEl = container.querySelector('.toast');
    expect(toastEl).toHaveClass('show');
    expect(toastEl).toHaveTextContent('Item added!');
  });

  it('renders without "show" CSS class when toast message is empty', () => {
    const { container } = render(
      <CartProvider>
        <Toast />
      </CartProvider>,
    );

    const toastEl = container.querySelector('.toast');
    expect(toastEl).toBeInTheDocument();
    expect(toastEl).not.toHaveClass('show');
    expect(toastEl).toHaveTextContent('');
  });
});
