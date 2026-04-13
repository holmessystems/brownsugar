import { useEffect, useRef, useState, useCallback } from 'react';

const APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
const LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

export default function useSquarePayment() {
  const cardRef = useRef(null);
  const [cardReady, setCardReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!APP_ID || APP_ID.includes('XXXX')) {
      setError('Square App ID not configured');
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        if (!window.Square) {
          setError('Square SDK not loaded');
          return;
        }
        const payments = window.Square.payments(APP_ID, LOCATION_ID);
        const card = await payments.card();
        if (cancelled) return;

        const container = document.getElementById('square-card-container');
        if (container) {
          container.innerHTML = '';
          await card.attach('#square-card-container');
          cardRef.current = card;
          setCardReady(true);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(init, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

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
