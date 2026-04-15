import { useEffect, useRef, useState, useCallback } from 'react';

const APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
const LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

export default function useSquarePayment(isOpen) {
  const cardRef = useRef(null);
  const paymentsRef = useRef(null);
  const [cardReady, setCardReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (cardRef.current) {
        try { cardRef.current.destroy(); } catch (_) {}
        cardRef.current = null;
      }
      setCardReady(false);
      return;
    }

    if (!APP_ID || APP_ID.includes('XXXX')) {
      setError('Square App ID not configured');
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        if (!window.Square) {
          setError('Square SDK not loaded — check your internet connection');
          return;
        }

        if (!paymentsRef.current) {
          paymentsRef.current = window.Square.payments(APP_ID, LOCATION_ID);
        }

        const card = await paymentsRef.current.card();
        if (cancelled) return;

        const container = document.getElementById('square-card-container');
        if (container) {
          container.innerHTML = '';
          await card.attach('#square-card-container');
          cardRef.current = card;
          setCardReady(true);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    // Small delay to ensure the modal DOM is fully rendered
    const timer = setTimeout(init, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen]);

  const tokenize = useCallback(async () => {
    if (!cardRef.current) throw new Error('Card form not ready');
    setLoading(true);
    setError(null);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status === 'OK') {
        return result.token;
      }
      throw new Error(result.errors?.[0]?.message || 'Card tokenization failed');
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cardReady, loading, error, tokenize };
}
