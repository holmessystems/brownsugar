import { createContext, useContext, useState, useCallback, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [fulfillment, setFulfillment] = useState('pickup');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }, []);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`${item.name} added to cart`);
    setCartOpen(true);
  }, [showToast]);

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  }, []);

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = fulfillment === 'shipping' ? (subtotal >= 50 ? 0 : 10) : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <CartContext.Provider value={{
      cart, addToCart, changeQty, clearCart,
      fulfillment, setFulfillment,
      cartOpen, setCartOpen,
      checkoutOpen, setCheckoutOpen,
      toast, showToast,
      totalQty, subtotal, shipping, tax, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
