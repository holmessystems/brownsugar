import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalQty, setCartOpen } = useCart();
  return (
    <nav>
      <a href="#home" className="logo">
        <img src="/images/logo.png" alt="Brown Sugar Co." className="logo-img" />
      </a>
      <ul>
        <li><a href="#products">Products</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#catering">Catering</a></li>
      </ul>
      <button className="cart-btn" onClick={() => setCartOpen(true)}>
        Cart
        {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
      </button>
    </nav>
  );
}
