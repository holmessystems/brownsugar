import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../context/CartContext';
import ProductSection from '../components/ProductSection';
import { products, flavors } from '../data/products';
import { useEffect } from 'react';

// Spy helper to capture cart context
function CartSpy({ onCart }) {
  const ctx = useCart();
  useEffect(() => {
    onCart(ctx);
  });
  return null;
}

const fourPack = products.find((p) => p.boxSize === 4);
const sixPack = products.find((p) => p.boxSize === 6);

describe('ProductSection – multi-pack support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('renders a card for each product (4-pack and 6-pack)', async () => {
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    for (const prod of products) {
      expect(
        screen.getByRole('button', {
          name: new RegExp(`customize your ${prod.boxSize}-pack box`, 'i'),
        }),
      ).toBeInTheDocument();
    }
  });

  it('each card shows the correct price and pack size', async () => {
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    for (const prod of products) {
      expect(
        screen.getByText(new RegExp(`${prod.boxSize}-Pack.*\\$${prod.price}`)),
      ).toBeInTheDocument();
    }
  });
});

describe('ProductSection – 4-pack builder', () => {
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

    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );

    for (const flavor of flavors) {
      expect(screen.getByText(flavor.name)).toBeInTheDocument();
    }

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

    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );

    const addBtn = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });
    await user.click(addBtn);

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

    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );

    const addBtn = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });
    for (let i = 0; i < fourPack.boxSize; i++) {
      await user.click(addBtn);
    }

    for (const flavor of flavors) {
      const btn = screen.getByRole('button', {
        name: `Add one ${flavor.name}`,
      });
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

    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );

    const addBtn = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });
    for (let i = 0; i < fourPack.boxSize; i++) {
      await user.click(addBtn);
    }

    await user.click(screen.getByText(/add box to cart/i));

    expect(latestCtx.cart).toHaveLength(1);
    expect(latestCtx.cart[0].qty).toBe(1);
    expect(latestCtx.cart[0].price).toBe(fourPack.price);
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

    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );

    await user.click(
      screen.getByRole('button', { name: `Add one ${flavors[0].name}` }),
    );
    await user.click(
      screen.getByRole('button', { name: `Add one ${flavors[1].name}` }),
    );

    await user.click(screen.getByText('Reset'));

    const qtyDisplays = document.querySelectorAll('.qty-display');
    qtyDisplays.forEach((el) => {
      expect(el.textContent).toBe('0');
    });
  });
});

describe('ProductSection – 6-pack builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('clicking 6-pack card opens builder with correct box size header', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(
      screen.getByRole('button', { name: /customize your 6-pack box/i }),
    );

    expect(screen.getByText(/build your 6-pack/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 6/)).toBeInTheDocument();
  });

  it('6-pack builder allows selecting 6 rolls before disabling increment', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(
      screen.getByRole('button', { name: /customize your 6-pack box/i }),
    );

    const addBtn = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });

    // Should be able to click 6 times
    for (let i = 0; i < sixPack.boxSize; i++) {
      await user.click(addBtn);
    }

    // Now all increment buttons should be disabled
    for (const flavor of flavors) {
      expect(
        screen.getByRole('button', { name: `Add one ${flavor.name}` }),
      ).toBeDisabled();
    }
  });

  it('6-pack add to cart uses 6-pack price', async () => {
    const user = userEvent.setup();
    let latestCtx;
    render(
      <CartProvider>
        <CartSpy onCart={(ctx) => { latestCtx = ctx; }} />
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    await user.click(
      screen.getByRole('button', { name: /customize your 6-pack box/i }),
    );

    const addBtn = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });
    for (let i = 0; i < sixPack.boxSize; i++) {
      await user.click(addBtn);
    }

    await user.click(screen.getByText(/add box to cart/i));

    expect(latestCtx.cart).toHaveLength(1);
    expect(latestCtx.cart[0].price).toBe(sixPack.price);
    expect(latestCtx.cart[0].boxSize).toBe(6);
  });

  it('can add both 4-pack and 6-pack to cart', async () => {
    const user = userEvent.setup();
    let latestCtx;
    render(
      <CartProvider>
        <CartSpy onCart={(ctx) => { latestCtx = ctx; }} />
        <ProductSection />
      </CartProvider>,
    );
    await act(async () => {});

    // Add a 4-pack
    await user.click(
      screen.getByRole('button', { name: /customize your 4-pack box/i }),
    );
    const addBtn4 = screen.getByRole('button', {
      name: `Add one ${flavors[0].name}`,
    });
    for (let i = 0; i < fourPack.boxSize; i++) {
      await user.click(addBtn4);
    }
    await user.click(screen.getByText(/add box to cart/i));

    // Add a 6-pack
    await user.click(
      screen.getByRole('button', { name: /customize your 6-pack box/i }),
    );
    const addBtn6 = screen.getByRole('button', {
      name: `Add one ${flavors[1].name}`,
    });
    for (let i = 0; i < sixPack.boxSize; i++) {
      await user.click(addBtn6);
    }
    await user.click(screen.getByText(/add box to cart/i));

    expect(latestCtx.cart).toHaveLength(2);
    const prices = latestCtx.cart.map((c) => c.price).sort((a, b) => a - b);
    expect(prices).toEqual([fourPack.price, sixPack.price]);
  });
});
