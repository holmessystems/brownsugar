import { useCart } from '../context/CartContext';
import Totals from './Totals';

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, setCheckoutOpen, changeQty, fulfillment, setFulfillment, showToast } = useCart();

  const openCheckout = () => {
    if (cart.length === 0) { showToast('Add items to your cart first'); return; }
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className={`cart-overlay${cartOpen ? ' open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-panel${cartOpen ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="close-cart" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">Your cart is empty.<br />Browse our menu to get started.</p>
          ) : cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div style={{ flex: 1 }}>
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-meta">${item.price} / {item.perLabel}</p>
                <div className="cart-item-actions">
                  <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                  <span className="qty-display">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
              </div>
              <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="fulfillment-selector">
            <label>Fulfillment Method</label>
            <div className="fulfillment-tabs">
              <button className={`fulfillment-tab${fulfillment === 'pickup' ? ' active' : ''}`} onClick={() => setFulfillment('pickup')}>🏪 Pickup</button>
              <button className={`fulfillment-tab${fulfillment === 'shipping' ? ' active' : ''}`} onClick={() => setFulfillment('shipping')}>🚗 Delivery</button>
            </div>
          </div>
          {fulfillment === 'pickup' ? (
            <div className="pickup-info"><strong>Houston Pickup</strong><br />Available at pop-up events &amp; by appointment<br />DM us @officialbrownsugarco for details</div>
          ) : (
            <div className="shipping-note"><strong>Local Delivery Available</strong><br />Houston area delivery · Order by Thu for weekend delivery<br />Free delivery on orders $50+</div>
          )}
          {cart.length > 0 && <Totals />}
          <button className="checkout-btn" onClick={openCheckout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 2h2l2.5 7h6l1.5-5H5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7" cy="13" r="1" fill="white" /><circle cx="12" cy="13" r="1" fill="white" /></svg>
            Proceed to Checkout
          </button>
          <p className="square-badge">🔒 Secured by Square Payments</p>
        </div>
      </div>
    </>
  );
}
