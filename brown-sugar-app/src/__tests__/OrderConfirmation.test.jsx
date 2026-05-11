import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import OrderConfirmation from '../components/OrderConfirmation';
import { useEffect } from 'react';

const mockConfirmationData = {
  items: [
    { name: 'Cinnamon Roll Box', flavorKey: '2x Classic, 2x Matcha', price: 30, qty: 1 },
  ],
  subtotal: 30,
  tax: 2.48,
  total: 32.48,
  customer: { firstName: 'Jane', email: 'jane@example.com' },
  pickupDay: 'Sunday, April 19',
  pickupTime: '3:00 PM',
  pickupAddress: '3140 FM 1960 Rd W, Houston, TX 77068',
  pickupZip: '77068',
};

// Helper that sets confirmation state inside the same provider
function ConfirmationSetter({ open, data }) {
  const { setConfirmationOpen, setConfirmationData } = useCart();
  useEffect(() => {
    if (data) setConfirmationData(data);
    setConfirmationOpen(open);
  }, []);
  return null;
}

describe('OrderConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
  });

  it('displays customer name, email, items, totals, and pickup details when confirmationOpen=true', async () => {
    render(
      <CartProvider>
        <ConfirmationSetter open={true} data={mockConfirmationData} />
        <OrderConfirmation />
      </CartProvider>,
    );

    await act(async () => {});

    // Customer first name in thank-you banner
    expect(screen.getByText(/thank you, jane/i)).toBeInTheDocument();
    // Customer email in confirmation sub-text
    expect(screen.getByText(/jane@example\.com/i)).toBeInTheDocument();

    // Order items
    expect(screen.getByText('Cinnamon Roll Box')).toBeInTheDocument();
    expect(screen.getByText('2x Classic, 2x Matcha')).toBeInTheDocument();

    // Totals — subtotal $30.00 appears in both item price and totals section, so use getAllByText
    const subtotalMatches = screen.getAllByText('$30.00');
    expect(subtotalMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('$2.48')).toBeInTheDocument();
    expect(screen.getByText('$32.48')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Tax (8.25%)')).toBeInTheDocument();

    // Pickup details
    expect(screen.getByText('Sunday, April 19')).toBeInTheDocument();
    expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    expect(screen.getByText('3140 FM 1960 Rd W, Houston, TX 77068')).toBeInTheDocument();
    expect(screen.getByText('77068')).toBeInTheDocument();
  });

  it('renders nothing when confirmationOpen=false', async () => {
    const { container } = render(
      <CartProvider>
        <ConfirmationSetter open={false} data={null} />
        <OrderConfirmation />
      </CartProvider>,
    );

    await act(async () => {});

    // OrderConfirmation returns null, so no modal overlay should exist
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });
});
