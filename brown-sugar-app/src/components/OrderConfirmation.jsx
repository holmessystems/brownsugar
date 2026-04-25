import { useCart } from '../context/CartContext';

export default function OrderConfirmation() {
  const { confirmationOpen, setConfirmationOpen, confirmationData } = useCart();

  if (!confirmationOpen || !confirmationData) return null;

  const { items, subtotal, tax, total, customer, pickupDay, pickupTime, pickupAddress, pickupZip } = confirmationData;

  return (
    <div className="modal-overlay">
      <div className="modal confirmation-modal">
        <div className="modal-header">
          <h3>Order Confirmed ✓</h3>
          <button className="close-cart" onClick={() => setConfirmationOpen(false)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="confirmation-banner">
            <p>Thank you, {customer.firstName}! Your preorder has been placed.</p>
            <p className="confirmation-sub">A confirmation has been sent to {customer.email}</p>
          </div>

          <p className="modal-section">Order Summary</p>
          <div className="receipt-items">
            {items.map((item, i) => (
              <div key={i} className="receipt-item">
                <div>
                  <span className="receipt-item-name">{item.name}</span>
                  {item.flavorKey && <span className="receipt-item-flavors">{item.flavorKey}</span>}
                </div>
                <div className="receipt-item-right">
                  <span className="receipt-item-qty">×{item.qty}</span>
                  <span className="receipt-item-price">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-totals">
            <div className="receipt-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="receipt-row"><span>Tax (8.25%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="receipt-row grand"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          <p className="modal-section">Pickup Details</p>
          <div className="receipt-pickup">
            {pickupDay && (
              <div className="receipt-pickup-row">
                <span className="receipt-label">Date</span>
                <span>{pickupDay}</span>
              </div>
            )}
            <div className="receipt-pickup-row">
              <span className="receipt-label">Time</span>
              <span>{pickupTime}</span>
            </div>
            <div className="receipt-pickup-row">
              <span className="receipt-label">Location</span>
              <span>{pickupAddress}</span>
            </div>
            <div className="receipt-pickup-row">
              <span className="receipt-label">Zip Code</span>
              <span>{pickupZip}</span>
            </div>
          </div>

          <div className="receipt-instructions">
            <p><strong>Pickup Instructions:</strong></p>
            <ol>
              <li>Arrive at the address above at your selected time.</li>
              <li>Remain in your vehicle upon arrival.</li>
              <li>Text us your car make and color so we can find you.</li>
              <li>We'll bring your order directly to your car.</li>
            </ol>
          </div>

          <p className="receipt-note">
            Questions? Contact us at info@officialbrownsugarco.com or DM @officialbrownsugarco
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={() => setConfirmationOpen(false)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
