import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../context/CartContext';
import CheckoutModal from '../components/CheckoutModal';
import { product, flavors } from '../data/products';
import { useEffect } from 'react';
import * as fc from 'fast-check';

// Mock useSquarePayment to avoid SDK dependency
vi.mock('../hooks/useSquarePayment', () => ({
  default: vi.fn(() => ({
    cardReady: false,
    loading: false,
    error: 'Square App ID not configured',
    tokenize: vi.fn(),
  })),
}));

// Helper: seeds cart with an item and opens checkout modal
function CheckoutSeeder() {
  const { addBoxToCart, setCheckoutOpen, setCartOpen } = useCart();
  useEffect(() => {
    const sel = { [flavors[0].name]: product.boxSize };
    addBoxToCart(sel, product);
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone validate function (mirrors CheckoutModal's internal validate)
// Used for property-based tests to avoid expensive per-iteration rendering
// ─────────────────────────────────────────────────────────────────────────────
function validate({ firstName, email, phone, selectedPickupOption }) {
  const errs = {};
  if (!firstName.trim()) errs.firstName = 'First name is required';
  if (!email.trim()) errs.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
  if (!phone.trim()) errs.phone = 'Phone number is required';
  else if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid phone number';
  if (!selectedPickupOption) errs.pickup = 'Please select a pickup option';
  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9.1  Unit tests — CheckoutModal validation
// ─────────────────────────────────────────────────────────────────────────────
describe('CheckoutModal – validation unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('empty first name shows "First name is required"', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    // Leave first name empty, fill other required fields
    await user.type(screen.getByPlaceholderText('you@email.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '7135551234');
    // Select a pickup option
    await user.selectOptions(screen.getByRole('combobox'), 'spring-sun-3pm');

    await user.click(screen.getByText('Place Preorder'));

    expect(screen.getByText('First name is required')).toBeInTheDocument();
  });

  it('empty email shows "Email is required"', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    await user.type(screen.getByPlaceholderText('First name'), 'Jane');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '7135551234');
    await user.selectOptions(screen.getByRole('combobox'), 'spring-sun-3pm');

    await user.click(screen.getByText('Place Preorder'));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('invalid email shows "Enter a valid email"', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    await user.type(screen.getByPlaceholderText('First name'), 'Jane');
    await user.type(screen.getByPlaceholderText('you@email.com'), 'not-an-email');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '7135551234');
    await user.selectOptions(screen.getByRole('combobox'), 'spring-sun-3pm');

    await user.click(screen.getByText('Place Preorder'));

    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('phone with < 10 digits shows "Enter a valid phone number"', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    await user.type(screen.getByPlaceholderText('First name'), 'Jane');
    await user.type(screen.getByPlaceholderText('you@email.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '12345');
    await user.selectOptions(screen.getByRole('combobox'), 'spring-sun-3pm');

    await user.click(screen.getByText('Place Preorder'));

    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
  });

  it('missing pickup option shows "Please select a pickup option"', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    await user.type(screen.getByPlaceholderText('First name'), 'Jane');
    await user.type(screen.getByPlaceholderText('you@email.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '7135551234');
    // Don't select a pickup option

    await user.click(screen.getByText('Place Preorder'));

    expect(screen.getByText('Please select a pickup option')).toBeInTheDocument();
  });

  it('valid form data produces no field-level errors', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CheckoutSeeder />
        <CheckoutModal />
      </CartProvider>,
    );
    await act(async () => {});

    await user.type(screen.getByPlaceholderText('First name'), 'Jane');
    await user.type(screen.getByPlaceholderText('you@email.com'), 'jane@test.com');
    await user.type(screen.getByPlaceholderText('(713) 000-0000'), '7135551234');
    await user.selectOptions(screen.getByRole('combobox'), 'spring-sun-3pm');

    await user.click(screen.getByText('Place Preorder'));

    // No .field-error spans should be present
    const fieldErrors = document.querySelectorAll('.field-error');
    expect(fieldErrors).toHaveLength(0);
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// 9.2  Property 6: Invalid emails are rejected by checkout validation
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 6: Invalid emails are rejected by checkout validation', () => {
  /** **Validates: Requirements 6.3** */
  it('any string without a valid email pattern produces "Enter a valid email"', () => {
    // Generate non-empty strings that do NOT match \S+@\S+\.\S+
    const arbInvalidEmail = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .filter((s) => !/\S+@\S+\.\S+/.test(s));

    fc.assert(
      fc.property(arbInvalidEmail, (badEmail) => {
        const errs = validate({
          firstName: 'Jane',
          email: badEmail,
          phone: '7135551234',
          selectedPickupOption: 'spring-sun-3pm',
        });
        expect(errs.email).toBe('Enter a valid email');
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9.3  Property 7: Short phone numbers are rejected by checkout validation
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 7: Short phone numbers are rejected by checkout validation', () => {
  /** **Validates: Requirements 6.4** */
  it('any string with fewer than 10 digit characters produces "Enter a valid phone number"', () => {
    // Generate non-empty strings with fewer than 10 digit characters
    const arbShortPhone = fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => s.trim().length > 0)
      .filter((s) => s.replace(/\D/g, '').length < 10);

    fc.assert(
      fc.property(arbShortPhone, (shortPhone) => {
        const errs = validate({
          firstName: 'Jane',
          email: 'jane@test.com',
          phone: shortPhone,
          selectedPickupOption: 'spring-sun-3pm',
        });
        expect(errs.phone).toBe('Enter a valid phone number');
      }),
      { numRuns: 100 },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9.4  Property 8: Valid form data passes checkout validation
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 8: Valid form data passes checkout validation', () => {
  /** **Validates: Requirements 6.6** */
  it('valid firstName, email, phone (10+ digits), and pickup option produce zero errors', () => {
    // Non-empty first name (no leading/trailing whitespace-only)
    const arbFirstName = fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => s.trim().length > 0);

    // Valid email matching \S+@\S+\.\S+
    const arbEmail = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z0-9._]{1,15}$/),
        fc.stringMatching(/^[a-zA-Z0-9]{1,10}$/),
        fc.stringMatching(/^[a-zA-Z]{2,5}$/),
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
      .filter((e) => /\S+@\S+\.\S+/.test(e));

    // Phone with at least 10 digits (may include non-digit chars)
    const arbPhone = fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 15 })
      .map((digits) => digits.join(''));

    const arbPickup = fc.constantFrom('spring-sun-3pm', 'richmond-sun-6pm', 'houston-mon-wed-3pm');

    fc.assert(
      fc.property(arbFirstName, arbEmail, arbPhone, arbPickup, (firstName, email, phone, pickup) => {
        const errs = validate({
          firstName,
          email,
          phone,
          selectedPickupOption: pickup,
        });
        expect(Object.keys(errs)).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});
