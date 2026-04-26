import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../context/CartContext';
import ProductSection from '../components/ProductSection';
import { product, flavors } from '../data/products';
import { useEffect } from 'react';

// Spy helper to capture addBoxToCart calls
function CartSpy({ onCart }) {
  const ctx = useCart();
  useEffect(() => {
    onCart(ctx);
  });
  return null;
}

describe('ProductSection – box builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('builder displays all flavors with initial qty 0', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    // Open the builder by clicking the product card
    await user.click(screen.getByRole('button', { name: /customize your 4-pack box/i }));

    // Every flavor should be listed
    for (const flavor of flavors) {
      expect(screen.getByText(flavor.name)).toBeInTheDocument();
    }

    // All qty displays should show 0
    const qtyDisplays = document.querySelectorAll('.qty-display');
    expect(qtyDisplays).toHaveLength(flavors.length);
    qtyDisplays.forEach((el) => {
      expect(el.textContent).toBe('0');
    });
  });

  it('increment increases flavor qty by 1 when under box size', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(screen.getByRole('button', { name: /customize your 4-pack box/i }));

    const addBtn = screen.getByRole('button', { name: `Add one ${flavors[0].name}` });
    await user.click(addBtn);

    // Find the qty display for the first flavor row
    const flavorRow = addBtn.closest('.builder-flavor-row');
    const qtyDisplay = flavorRow.querySelector('.qty-display');
    expect(qtyDisplay.textContent).toBe('1');
  });

  it('increment buttons disabled when total equals box size', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(screen.getByRole('button', { name: /customize your 4-pack box/i }));

    // Fill the box with the first flavor (click boxSize times)
    const addBtn = screen.getByRole('button', { name: `Add one ${flavors[0].name}` });
    for (let i = 0; i < product.boxSize; i++) {
      await user.click(addBtn);
    }

    // All increment buttons should now be disabled
    for (const flavor of flavors) {
      const btn = screen.getByRole('button', { name: `Add one ${flavor.name}` });
      expect(btn).toBeDisabled();
    }
  });

  it('"Add Box to Cart" calls addBoxToCart and closes builder', async () => {
    const user = userEvent.setup();
    let latestCtx;
    render(
      <CartProvider>
        <CartSpy onCart={(ctx) => { latestCtx = ctx; }} />
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(screen.getByRole('button', { name: /customize your 4-pack box/i }));

    // Fill the box
    const addBtn = screen.getByRole('button', { name: `Add one ${flavors[0].name}` });
    for (let i = 0; i < product.boxSize; i++) {
      await user.click(addBtn);
    }

    // Click "Add Box to Cart"
    await user.click(screen.getByText(/add box to cart/i));

    // Cart should have one item
    expect(latestCtx.cart).toHaveLength(1);
    expect(latestCtx.cart[0].qty).toBe(1);

    // Builder modal should be closed (no builder-modal in DOM)
    expect(document.querySelector('.builder-modal')).toBeNull();
  });

  it('"Reset" sets all flavor quantities to 0', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(screen.getByRole('button', { name: /customize your 4-pack box/i }));

    // Add some flavors
    await user.click(screen.getByRole('button', { name: `Add one ${flavors[0].name}` }));
    await user.click(screen.getByRole('button', { name: `Add one ${flavors[1].name}` }));

    // Click Reset
    await user.click(screen.getByText('Reset'));

    // All qty displays should be 0
    const qtyDisplays = document.querySelectorAll('.qty-display');
    qtyDisplays.forEach((el) => {
      expect(el.textContent).toBe('0');
    });
  });
});
