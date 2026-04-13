import { useCart } from '../context/CartContext';

export default function Totals() {
  const { subtotal, shipping, tax, total, fulfillment } = useCart();
  return (
    <div className="cart-totals">
      <div className="cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
      <div className="cart-total-row">
        <span>{fulfillment === 'shipping' ? 'Delivery' : 'Pickup'}</span>
        <span>{shipping === 0 ? (fulfillment === 'pickup' ? 'Free' : 'Free (order qualifies)') : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="cart-total-row"><span>Tax (8.25%)</span><span>${tax.toFixed(2)}</span></div>
      <div className="cart-total-row grand"><span>Total</span><span>${total.toFixed(2)}</span></div>
    </div>
  );
}
