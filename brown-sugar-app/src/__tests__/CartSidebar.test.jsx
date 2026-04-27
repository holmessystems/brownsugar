import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import CartSidebar from '../components/CartSidebar';
import { product, flavors } from '../data/products';
import { useEffect } from 'react';

// Helper that adds a box to cart and opens the sidebar
function CartSeeder({ selections, open }) {
  const { addBoxToCart, setCartOpen } = useCart();
  useEffect(() => {
    if (selections) addBoxToCart(selections, product);
    if (open) setCartOpen(true);
  }, []);
  return null;
}

describe('CartSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('displays "Your cart is empty" when cart has no items', async () => {
    render(
      <CartProvider>
        <CartSidebar />
      </CartProvider>,
    );

    await act(async () => {});

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('displays item names, price per box, quantities, and "Proceed to Checkout" when cart has items', async () => {
    const sel = { [flavors[0].name]: product.boxSize };

    render(
      <CartProvider>
        <CartSeeder selections={sel} open={true} />
        <CartSidebar />
      </CartProvider>,
    );

    await act(async () => {});

    // Item name
    expect(screen.getByText(product.name)).toBeInTheDocument();
    // Price per box
    expect(screen.getByText(`$${product.price} / box`)).toBeInTheDocument();
    // Quantity display
    expect(screen.getByText('1')).toBeInTheDocument();
    // Proceed to Checkout button
    expect(screen.getByText(/proceed to checkout/i)).toBeInTheDocument();
  });
});
