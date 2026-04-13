import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalQty, setCartOpen } = useCart();
  return (
    <nav>
      <div className="logo">Brown Sugar<span>Co.</span></div>
      <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button className="cart-btn" onClick={() => setCartOpen(true)}>
        Cart
        {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
      </button>
    </nav>
  );
}
