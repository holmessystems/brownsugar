import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('renders Cart button and navigation links within CartProvider', () => {
    render(
      <CartProvider>
        <Navbar />
      </CartProvider>,
    );

    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Catering')).toBeInTheDocument();
  });
});
