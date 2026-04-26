import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { product, flavors } from '../data/products';
import * as fc from 'fast-check';

// Helper: wrap renderHook with CartProvider
function renderCartHook() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  });
}

// Helper: build a valid flavor selection summing to boxSize
function validFlavorSelection() {
  return { [flavors[0].name]: product.boxSize };
}

// Helper: build a second distinct valid flavor selection
function altFlavorSelection() {
  return { [flavors[1].name]: product.boxSize };
}

// ─── fast-check arbitrary: random valid flavor selection summing to boxSize ───
function arbValidFlavorSelection() {
  const flavorNames = flavors.map((f) => f.name);
  return fc
    .array(fc.nat({ max: flavorNames.length - 1 }), {
      minLength: product.boxSize,
      maxLength: product.boxSize,
    })
    .map((indices) => {
      const sel = {};
      for (const idx of indices) {
        const name = flavorNames[idx];
        sel[name] = (sel[name] || 0) + 1;
      }
      return sel;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.1  Unit tests
// ─────────────────────────────────────────────────────────────────────────────
describe('CartContext – unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('addBoxToCart with valid selection creates correct cart item', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    const sel = { Classic: 2, Matcha: 1, Blueberry: 1 };
    act(() => result.current.addBoxToCart(sel, product));

    expect(result.current.cart).toHaveLength(1);
    const item = result.current.cart[0];
    expect(item.flavorKey).toContain('Classic');
    expect(item.flavorKey).toContain('Matcha');
    expect(item.flavorKey).toContain('Blueberry');
    expect(item.price).toBe(product.price);
    expect(item.qty).toBe(1);
  });

  it('duplicate flavor combination increments qty instead of adding duplicate', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    const sel = validFlavorSelection();
    act(() => result.current.addBoxToCart(sel, product));
    act(() => result.current.addBoxToCart(sel, product));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
  });

  it('changeQty with delta -1 on qty=1 removes item', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    const sel = validFlavorSelection();
    act(() => result.current.addBoxToCart(sel, product));
    expect(result.current.cart).toHaveLength(1);

    const item = result.current.cart[0];
    act(() => result.current.changeQty(item.id, -1, item.flavorKey));

    expect(result.current.cart).toHaveLength(0);
  });

  it('changeQty with positive delta increases qty', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    const sel = validFlavorSelection();
    act(() => result.current.addBoxToCart(sel, product));

    const item = result.current.cart[0];
    act(() => result.current.changeQty(item.id, 3, item.flavorKey));

    expect(result.current.cart[0].qty).toBe(4); // 1 + 3
  });

  it('clearCart sets cart to empty array', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    act(() => result.current.addBoxToCart(validFlavorSelection(), product));
    act(() => result.current.addBoxToCart(altFlavorSelection(), product));
    expect(result.current.cart.length).toBeGreaterThan(0);

    act(() => result.current.clearCart());
    expect(result.current.cart).toEqual([]);
  });

  it('addBoxToCart with invalid flavor total shows toast and does not modify cart', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    const badSel = { Classic: 1 }; // only 1, need boxSize (4)
    act(() => result.current.addBoxToCart(badSel, product));

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.toast).toMatch(/select exactly/i);
  });

  it('addBoxToCart when date is sold out shows toast and does not modify cart', async () => {
    // Simulate sold-out by setting a pickup date and maxing out order counts
    const { result } = renderCartHook();
    await act(async () => {});

    // Set a pickup date, then exhaust the daily cap
    act(() => result.current.setSelectedPickupDate('2025-01-01'));

    // Fill up orders to the daily cap
    for (let i = 0; i < result.current.dailyOrderCap; i++) {
      act(() => result.current.addBoxToCart(validFlavorSelection(), product));
    }

    // Clear cart but keep order counts
    const countBefore = result.current.cart.length;
    act(() => result.current.clearCart());

    // Now try to add — should be sold out for this date
    act(() => result.current.addBoxToCart(validFlavorSelection(), product));
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.toast).toMatch(/sold out/i);
  });

  it('subtotal, tax, and total are correctly computed', async () => {
    const { result } = renderCartHook();
    await act(async () => {});

    act(() => result.current.addBoxToCart(validFlavorSelection(), product));
    act(() => result.current.addBoxToCart(altFlavorSelection(), product));

    // 2 distinct items, each qty 1, price 30 → subtotal = 60
    const expectedSubtotal = product.price * 2;
    const expectedTax = expectedSubtotal * 0.0825;
    const expectedTotal = expectedSubtotal + expectedTax;

    expect(result.current.subtotal).toBe(expectedSubtotal);
    expect(result.current.tax).toBeCloseTo(expectedTax, 2);
    expect(result.current.total).toBeCloseTo(expectedTotal, 2);
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// 2.2  Property 1: Valid flavor selections produce correct cart items
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 1: Valid flavor selections produce correct cart items', () => {
  /** **Validates: Requirements 2.1** */
  it('any valid flavor selection produces a cart item with correct flavorKey, price, and qty=1', () => {
    fc.assert(
      fc.property(arbValidFlavorSelection(), (sel) => {
        // Render a fresh hook for each example
        const { result } = renderCartHook();

        // Wait for mount effect (fetch)
        act(() => {});

        act(() => result.current.addBoxToCart(sel, product));

        const cart = result.current.cart;
        expect(cart).toHaveLength(1);

        const item = cart[0];
        // flavorKey should mention every selected flavor
        for (const [name, qty] of Object.entries(sel)) {
          if (qty > 0) {
            expect(item.flavorKey).toContain(name);
            expect(item.flavorKey).toContain(`${qty}x ${name}`);
          }
        }
        expect(item.price).toBe(product.price);
        expect(item.qty).toBe(1);
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.3  Property 2: Duplicate flavor combinations increment quantity
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 2: Duplicate flavor combinations increment quantity', () => {
  /** **Validates: Requirements 2.2** */
  it('calling addBoxToCart twice with the same selection yields one item with qty=2', () => {
    fc.assert(
      fc.property(arbValidFlavorSelection(), (sel) => {
        const { result } = renderCartHook();
        act(() => {});

        act(() => result.current.addBoxToCart(sel, product));
        act(() => result.current.addBoxToCart(sel, product));

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].qty).toBe(2);
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.4  Property 3: Positive delta increases item quantity
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 3: Positive delta increases item quantity', () => {
  /** **Validates: Requirements 2.4** */
  it('changeQty with any positive delta increases qty by exactly that amount', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (delta) => {
        const { result } = renderCartHook();
        act(() => {});

        act(() =>
          result.current.addBoxToCart(validFlavorSelection(), product),
        );

        const item = result.current.cart[0];
        const qtyBefore = item.qty; // should be 1

        act(() => result.current.changeQty(item.id, delta, item.flavorKey));

        expect(result.current.cart[0].qty).toBe(qtyBefore + delta);
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.5  Property 4: Cart totals are correctly derived
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 4: Cart totals are correctly derived', () => {
  /** **Validates: Requirements 2.5, 2.6, 2.7** */
  it('subtotal, tax, and total are correct for any cart contents', () => {
    // Arbitrary: array of { price, qty } pairs
    const arbCartItems = fc.array(
      fc.record({
        price: fc.integer({ min: 1, max: 500 }),
        qty: fc.integer({ min: 1, max: 50 }),
      }),
      { minLength: 1, maxLength: 10 },
    );

    fc.assert(
      fc.property(arbCartItems, (items) => {
        const { result } = renderCartHook();
        act(() => {});

        // Add one item per entry, using unique flavor combos
        items.forEach((entry, idx) => {
          // Create a unique product variant for each entry
          const customProduct = { ...product, price: entry.price, id: idx + 1 };
          const sel = { [flavors[idx % flavors.length].name]: product.boxSize };

          act(() => result.current.addBoxToCart(sel, customProduct));

          // If qty > 1, bump it up
          if (entry.qty > 1) {
            const cartItem = result.current.cart.find(
              (c) => c.id === customProduct.id,
            );
            if (cartItem) {
              act(() =>
                result.current.changeQty(
                  cartItem.id,
                  entry.qty - 1,
                  cartItem.flavorKey,
                ),
              );
            }
          }
        });

        // Compute expected values from the actual cart
        const expectedSubtotal = result.current.cart.reduce(
          (s, c) => s + c.price * c.qty,
          0,
        );
        const expectedTax = expectedSubtotal * 0.0825;
        const expectedTotal = expectedSubtotal + expectedTax;

        expect(result.current.subtotal).toBe(expectedSubtotal);
        expect(result.current.tax).toBeCloseTo(expectedTax, 2);
        expect(result.current.total).toBeCloseTo(expectedTotal, 2);
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.6  Property 5: Invalid flavor selections are rejected
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 5: Invalid flavor selections are rejected', () => {
  /** **Validates: Requirements 2.9** */
  it('flavor selections not summing to boxSize leave cart unchanged and trigger toast', () => {
    const flavorNames = flavors.map((f) => f.name);

    // Generate a total that is NOT equal to boxSize
    const arbBadTotal = fc
      .integer({ min: 0, max: product.boxSize * 3 })
      .filter((n) => n !== product.boxSize);

    // Distribute that total across random flavors
    const arbInvalidSelection = arbBadTotal.chain((total) => {
      if (total === 0) return fc.constant({});
      return fc
        .array(fc.nat({ max: flavorNames.length - 1 }), {
          minLength: total,
          maxLength: total,
        })
        .map((indices) => {
          const sel = {};
          for (const idx of indices) {
            sel[flavorNames[idx]] = (sel[flavorNames[idx]] || 0) + 1;
          }
          return sel;
        });
    });

    fc.assert(
      fc.property(arbInvalidSelection, (sel) => {
        const { result } = renderCartHook();
        act(() => {});

        act(() => result.current.addBoxToCart(sel, product));

        expect(result.current.cart).toHaveLength(0);
        expect(result.current.toast).toMatch(/select exactly/i);
      }),
      { numRuns: 100 },
    );
  });
});
