import { useCart } from '../context/CartContext';

export default function Totals() {
  const { subtotal, tax, total } = useCart();
  return (
    <div className="cart-totals">
      <div className="cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
      <div className="cart-total-row"><span>Tax (8.25%)</span><span>${tax.toFixed(2)}</span></div>
      <div className="cart-total-row grand"><span>Total</span><span>${total.toFixed(2)}</span></div>
    </div>
  );
}
