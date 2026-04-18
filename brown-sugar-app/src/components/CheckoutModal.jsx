import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Totals from './Totals';
import useSquarePayment from '../hooks/useSquarePayment';

export default function CheckoutModal() {
  const {
    checkoutOpen, setCheckoutOpen,
    showToast, clearCart, cart, total, subtotal, tax,
    selectedPickupOption, setSelectedPickupOption,
    pickupOptions,
    setConfirmationOpen, setConfirmationData,
    pickupDay,
  } = useCart();

  const { cardReady, loading, error: cardError, tokenize } = useSquarePayment(checkoutOpen);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');

  if (!checkoutOpen) return null;

  const isConfigured = !cardError?.includes('not configured');

  const selectedOption = pickupOptions.find(o => o.id === selectedPickupOption) || null;

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail('');
    setPhone(''); setInstructions('');
    setSelectedPickupOption(null); setErrors({}); setPaymentError('');
  };

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid phone number';
    if (!selectedPickupOption) errs.pickup = 'Please select a pickup option';
    return errs;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('Please complete all required fields');
      return;
    }
    setErrors({});
    setPaymentError('');

    const pickupAddress = selectedOption?.address || '';
    const pickupTime = selectedOption?.time || '';
    const pickupZip = selectedOption?.zip || '';
    const pickupDate = selectedOption?.date || '';

    // Build confirmation data
    const pickupDayFormatted = pickupDay
      ? new Date(pickupDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : '';
    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        flavorKey: item.flavorKey || item.flavor || '',
        qty: item.qty,
        price: item.price,
      })),
      subtotal,
      tax,
      total,
      customer: { firstName, lastName, email, phone },
      pickupDay: pickupDate || pickupDayFormatted,
      pickupTime,
      pickupAddress,
      pickupZip,
    };

    // If Square isn't configured, do a demo order
    if (!isConfigured) {
      setConfirmationData(orderData);
      clearCart();
      setCheckoutOpen(false);
      setConfirmationOpen(true);
      resetForm();

      fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).catch(err => console.error('Email send failed:', err));

      return;
    }

    setSubmitting(true);
    try {
      const token = await tokenize();

      const fulfillmentLabel = `Pickup ${pickupDate} at ${pickupAddress} — ${pickupTime}`;

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: token,
          currency: 'USD',
          customer: { firstName, lastName, email, phone, instructions },
          cart: cart.map(({ id, name, price, qty, flavorKey }) => ({ id, name, price, qty, flavorKey })),
          fulfillment: fulfillmentLabel,
          pickupAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'Payment failed — please try again.';
        setPaymentError(msg);
        showToast(msg);
        return;
      }

      setConfirmationData({ ...orderData, paymentId: data.paymentId, receiptUrl: data.receiptUrl });
      clearCart();
      setCheckoutOpen(false);
      setConfirmationOpen(true);
      resetForm();

      fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).catch(err => console.error('Email send failed:', err));
    } catch (err) {
      const msg = err.message || 'Something went wrong — please try again.';
      setPaymentError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Complete Your Preorder</h3>
          <button className="close-cart" onClick={() => setCheckoutOpen(false)}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-section">Contact Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} aria-invalid={!!errors.firstName} />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" placeholder="(713) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <p className="modal-section">Pickup Details</p>
          <div className="form-group">
            <label>Select Pickup Option *</label>
            <select
              value={selectedPickupOption || ''}
              onChange={e => setSelectedPickupOption(e.target.value || null)}
              aria-invalid={!!errors.pickup}
            >
              <option value="">Choose a pickup location & time</option>
              {pickupOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {errors.pickup && <span className="field-error">{errors.pickup}</span>}
          </div>
          {selectedOption && (
            <div className="pickup-day-badge" style={{
              background: '#f5ede0', border: '1px solid #e8d5bc', borderRadius: '6px',
              padding: '10px 14px', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#3a2d24',
              lineHeight: 1.6,
            }}>
              📅 <strong>{selectedOption.date}</strong> at <strong>{selectedOption.time}</strong><br />
              📍 {selectedOption.address}
            </div>
          )}
          <p className="pickup-note-checkout">Exact pickup address will be provided on your receipt after checkout.</p>

          <div className="form-group">
            <label>Special Instructions (optional)</label>
            <textarea placeholder="Dietary notes, allergies, pickup preferences..." value={instructions} onChange={e => setInstructions(e.target.value)} />
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
            {paymentError && (
              <div className="payment-error-banner" style={{
                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px',
                padding: '10px 14px', marginTop: '0.75em', fontSize: '0.8rem', color: '#991b1b',
                lineHeight: 1.5,
              }}>
                <strong>Payment Error:</strong> {paymentError}
              </div>
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
            {submitting ? 'Processing...' : 'Place Preorder'}
          </button>
        </div>
      </div>
    </div>
  );
}
