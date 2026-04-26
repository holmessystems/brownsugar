import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import Totals from '../components/Totals';
import { product, flavors } from '../data/products';
import { useEffect } from 'react';

// Helper that adds items to cart within the same provider
function CartSeeder({ selections }) {
  const { addBoxToCart } = useCart();
  useEffect(() => {
    for (const sel of selections) {
      addBoxToCart(sel, product);
    }
  }, []);
  return null;
}

describe('Totals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('displays subtotal, tax (8.25%), and total formatted to two decimal places', async () => {
    // Add 2 distinct boxes: subtotal = 30 * 2 = 60
    const selections = [
      { [flavors[0].name]: product.boxSize },
      { [flavors[1].name]: product.boxSize },
    ];

    const expectedSubtotal = product.price * 2;
    const expectedTax = expectedSubtotal * 0.0825;
    const expectedTotal = expectedSubtotal + expectedTax;

    render(
      <CartProvider>
        <CartSeeder selections={selections} />
        <Totals />
      </CartProvider>,
    );

    await act(async () => {});

    expect(screen.getByText(`$${expectedSubtotal.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${expectedTax.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${expectedTotal.toFixed(2)}`)).toBeInTheDocument();

    // Verify labels
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Tax (8.25%)')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
