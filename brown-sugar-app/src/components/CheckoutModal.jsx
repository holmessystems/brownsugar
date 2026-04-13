import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Totals from './Totals';
import useSquarePayment from '../hooks/useSquarePayment';

export default function CheckoutModal() {
  const {
    checkoutOpen, setCheckoutOpen, fulfillment,
    showToast, clearCart, cart, total,
  } = useCart();

  const { cardReady, loading, error: cardError, tokenize } = useSquarePayment();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: 'TX', zip: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!checkoutOpen) return null;

  const isConfigured = !cardError?.includes('not configured');

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail('');
    setPhone(''); setInstructions('');
    setAddress({ street: '', city: '', state: 'TX', zip: '' });
  };

  const submit = async () => {
    if (!firstName || !email) {
      showToast('Please complete your contact info');
      return;
    }

    // If Square isn't configured, do a demo order
    if (!isConfigured) {
      showToast('Demo mode — order placed! Confirmation sent to ' + email);
      clearCart(); setCheckoutOpen(false); resetForm();
      return;
    }

    setSubmitting(true);
    try {
      const token = await tokenize();

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: token,
          amount: Math.round(total * 100), // cents
          currency: 'USD',
          customer: { firstName, lastName, email, phone, instructions },
          cart: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
          fulfillment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Payment failed — please try again');
        return;
      }

      showToast('Order placed! Confirmation sent to ' + email);
      clearCart(); setCheckoutOpen(false); resetForm();
    } catch (err) {
      showToast(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Complete Your Order</h3>
          <button className="close-cart" onClick={() => setCheckoutOpen(false)}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-section">Contact Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="(713) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          {fulfillment === 'shipping' && (
            <>
              <p className="modal-section">Delivery Address</p>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" placeholder="123 Main St" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="Houston" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" placeholder="TX" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input type="text" placeholder="77002" value={address.zip} onChange={e => setAddress(p => ({ ...p, zip: e.target.value }))} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Special Instructions (optional)</label>
            <textarea placeholder="Dietary notes, allergies, delivery preferences..." value={instructions} onChange={e => setInstructions(e.target.value)} />
          </div>

          <p className="modal-section">Payment</p>
          <div className="square-payment-area">
            <div className="square-logo">
              <div className="square-logo-mark">■</div>
              <span className="square-logo-text">Secured by Square</span>
            </div>
            <div id="square-card-container">
              {!isConfigured && (
                <>
                  Demo mode — no Square keys configured.<br />
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                    Add VITE_SQUARE_APP_ID to enable live payments
                  </small>
                </>
              )}
            </div>
            {cardError && isConfigured && (
              <p style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.5em' }}>{cardError}</p>
            )}
            <p className="square-note">Your payment is encrypted and processed directly by Square. We never store your card details.</p>
          </div>
          <Totals />
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={() => setCheckoutOpen(false)}>Back to Cart</button>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={submitting || (isConfigured && loading)}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
