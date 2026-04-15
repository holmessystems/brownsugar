import { createContext, useContext, useState, useCallback, useRef } from 'react';
import siteConfig from '../data/siteConfig.json';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [toast, setToast] = useState('');
  const [selectedPickupDate, setSelectedPickupDate] = useState(null);
  const [selectedPickupZip, setSelectedPickupZip] = useState('');
  const [orderCounts, setOrderCounts] = useState({});
  const toastTimer = useRef(null);

  const dailyOrderCap = siteConfig.dailyOrderCap ?? 20;
  const pickupZipCodes = siteConfig.pickupZipCodes ?? [];

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

  // Add a customized 4-pack box to cart
  const addBoxToCart = useCallback((flavorSelections, product) => {
    if (selectedPickupDate && isDateSoldOut(selectedPickupDate)) {
      showToast('Sold out for this date.');
      return;
    }

    // flavorSelections is an object like { "Classic": 2, "Matcha": 1, "Peach Cobbler": 1 }
    const totalRolls = Object.values(flavorSelections).reduce((s, q) => s + q, 0);
    if (totalRolls !== product.boxSize) {
      showToast(`Please select exactly ${product.boxSize} rolls for your box.`);
      return;
    }

    // Build a unique key from the flavor combo
    const flavorKey = Object.entries(flavorSelections)
      .filter(([, qty]) => qty > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ');

    setCart(prev => {
      const existing = prev.find(c => c.id === product.id && c.flavorKey === flavorKey);
      if (existing) {
        return prev.map(c =>
          c.id === product.id && c.flavorKey === flavorKey
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }
      return [...prev, {
        ...product,
        flavorKey,
        flavorSelections: { ...flavorSelections },
        qty: 1,
      }];
    });

    if (selectedPickupDate) {
      setOrderCounts(prev => ({
        ...prev,
        [selectedPickupDate]: (prev[selectedPickupDate] ?? 0) + 1,
      }));
    }

    showToast(`Custom box added to cart`);
    setCartOpen(true);
  }, [showToast, selectedPickupDate, isDateSoldOut]);

  // Legacy single-flavor add (kept for compatibility)
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

  const changeQty = useCallback((id, delta, flavorKey) => {
    setCart(prev =>
      prev
        .map(c =>
          c.id === id && (c.flavorKey === flavorKey || c.flavor === flavorKey)
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
      cart, addToCart, addBoxToCart, changeQty, clearCart,
      cartOpen, setCartOpen,
      checkoutOpen, setCheckoutOpen,
      confirmationOpen, setConfirmationOpen,
      confirmationData, setConfirmationData,
      toast, showToast,
      totalQty, subtotal, tax, total,
      selectedPickupDate, setSelectedPickupDate,
      selectedPickupZip, setSelectedPickupZip,
      pickupZipCodes,
      orderCounts, dailyOrderCap,
      isDateSoldOut, canOrderForDate,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
