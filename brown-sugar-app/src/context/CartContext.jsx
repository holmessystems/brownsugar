import { createContext, useContext, useState, useCallback, useRef } from 'react';
import siteConfig from '../data/siteConfig.json';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedPickupDate, setSelectedPickupDate] = useState(null);
  const [orderCounts, setOrderCounts] = useState({});
  const toastTimer = useRef(null);

  const dailyOrderCap = siteConfig.dailyOrderCap ?? 20;

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }, []);

  const isDateSoldOut = useCallback((date) => {
    return (orderCounts[date] ?? 0) >= dailyOrderCap;
  }, [orderCounts, dailyOrderCap]);

  const canOrderForDate = useCallback((date) => {
    return !isDateSoldOut(date);
  }, [isDateSoldOut]);

  const addToCart = useCallback((item, flavor) => {
    if (selectedPickupDate && isDateSoldOut(selectedPickupDate)) {
      showToast('Sold out for this date.');
      return;
    }

    setCart(prev => {
      const cartItem = { ...item, flavor: flavor || 'classic' };
      const existing = prev.find(c => c.id === cartItem.id && c.flavor === cartItem.flavor);
      if (existing) {
        return prev.map(c =>
          c.id === cartItem.id && c.flavor === cartItem.flavor
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }
      return [...prev, { ...cartItem, qty: 1 }];
    });

    if (selectedPickupDate) {
      setOrderCounts(prev => ({
        ...prev,
        [selectedPickupDate]: (prev[selectedPickupDate] ?? 0) + 1,
      }));
    }

    const displayName = flavor ? `${item.name} (${flavor})` : item.name;
    showToast(`${displayName} added to cart`);
    setCartOpen(true);
  }, [showToast, selectedPickupDate, isDateSoldOut]);

  const changeQty = useCallback((id, delta, flavor) => {
    setCart(prev =>
      prev
        .map(c =>
          c.id === id && c.flavor === flavor
            ? { ...c, qty: c.qty + delta }
            : c
        )
        .filter(c => c.qty > 0)
    );
  }, []);

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <CartContext.Provider value={{
      cart, addToCart, changeQty, clearCart,
      cartOpen, setCartOpen,
      checkoutOpen, setCheckoutOpen,
      toast, showToast,
      totalQty, subtotal, tax, total,
      selectedPickupDate, setSelectedPickupDate,
      orderCounts, dailyOrderCap,
      isDateSoldOut, canOrderForDate,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
