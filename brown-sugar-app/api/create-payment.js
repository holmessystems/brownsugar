import { randomUUID } from 'crypto';

const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

const SQUARE_VERSION = '2024-01-18';
const LOCATION_ID = process.env.VITE_SQUARE_LOCATION_ID;
const TAX_RATE = 0.0825;

function squareFetch(path, body) {
  return fetch(`${SQUARE_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Square-Version': SQUARE_VERSION,
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Map Square error codes to customer-friendly messages
function friendlyPaymentError(errors) {
  if (!errors || !errors.length) return 'Payment failed — please try again.';

  const err = errors[0];
  const code = err.code || '';
  const category = err.category || '';

  // Card-specific errors
  if (code === 'CARD_DECLINED' || code === 'GENERIC_DECLINE')
    return 'Your card was declined. Please check your card details or try a different card.';
  if (code === 'INSUFFICIENT_FUNDS')
    return 'Insufficient funds. Please try a different card.';
  if (code === 'CARD_EXPIRED' || code === 'INVALID_EXPIRATION')
    return 'Your card is expired. Please use a different card.';
  if (code === 'INVALID_CARD' || code === 'INVALID_CARD_DATA')
    return 'Invalid card details. Please double-check your card number, expiration, and CVV.';
  if (code === 'CVV_FAILURE')
    return 'CVV verification failed. Please check the security code on the back of your card.';
  if (code === 'ADDRESS_VERIFICATION_FAILURE')
    return 'Address verification failed. Please check the billing address associated with your card.';
  if (code === 'CARD_DECLINED_VERIFICATION_REQUIRED')
    return 'Your bank requires additional verification. Please contact your bank or try a different card.';
  if (code === 'VOICE_FAILURE' || code === 'CARD_DECLINED_CALL_ISSUER')
    return 'Your bank has flagged this transaction. Please contact your bank or try a different card.';
  if (code === 'PAN_FAILURE')
    return 'Invalid card number. Please re-enter your card details.';
  if (code === 'ALLOWABLE_PIN_TRIES_EXCEEDED')
    return 'Too many incorrect PIN attempts. Please try a different card.';
  if (code === 'CARD_NOT_SUPPORTED')
    return 'This card type is not supported. Please try a different card.';
  if (code === 'TRANSACTION_LIMIT')
    return 'This transaction exceeds the card\'s limit. Please try a smaller amount or use a different card.';
  if (code === 'TEMPORARILY_UNAVAILABLE')
    return 'Payment processing is temporarily unavailable. Please try again in a few minutes.';

  // Category-level fallbacks
  if (category === 'PAYMENT_METHOD_ERROR')
    return 'There was a problem with your payment method. Please try a different card.';
  if (category === 'REFUND_ERROR')
    return 'There was a refund processing error. Please contact support.';

  // Use Square's detail message if available, otherwise generic
  return err.detail || 'Payment could not be processed. Please try again or use a different card.';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sourceId, currency, customer, cart, fulfillment, pickupAddress } = req.body;

  if (!sourceId) {
    return res.status(400).json({ error: 'Missing payment source' });
  }
  if (!cart || !cart.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // 1. Compute totals server-side from cart to avoid mismatch
    const cur = currency || 'USD';
    const lineItems = (cart || []).map(item => ({
      name: item.flavorKey
        ? `${item.name} (${item.flavorKey})`
        : item.name,
      quantity: String(item.qty),
      base_price_money: {
        amount: Math.round(item.price * 100),
        currency: cur,
      },
    }));

    const subtotalCents = cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0);
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents;

    // Build pickup fulfillment
    const pickupAt = new Date();
    pickupAt.setDate(pickupAt.getDate() + 1); // default to tomorrow
    const fulfillmentNote = [
      customer?.instructions || '',
      pickupAddress ? `Pickup Location: ${pickupAddress}` : '',
      fulfillment || '',
    ].filter(Boolean).join(' | ');
    const fulfillmentDetails = {
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
          email_address: customer?.email || '',
          phone_number: customer?.phone || '',
        },
        note: fulfillmentNote,
        schedule_type: 'SCHEDULED',
        pickup_at: pickupAt.toISOString(),
      },
    };

    // Include tax as a line-level tax so Square's order total matches our payment amount
    const orderRes = await squareFetch('/v2/orders', {
      idempotency_key: randomUUID(),
      order: {
        location_id: LOCATION_ID,
        line_items: lineItems,
        taxes: [
          {
            uid: 'sales-tax',
            name: 'Sales Tax',
            percentage: String(TAX_RATE * 100),
            scope: 'ORDER',
          },
        ],
        fulfillments: [fulfillmentDetails],
        metadata: {
          fulfillment_info: fulfillment || 'pickup',
        },
      },
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error('Square order error:', orderData);
      const msg = orderData.errors?.[0]?.detail || 'Failed to create order';
      return res.status(400).json({ error: msg });
    }

    const orderId = orderData.order.id;
    // Use Square's computed total so payment always matches the order
    const orderTotalCents = orderData.order.total_money?.amount ?? totalCents;

    // 2. Create the payment linked to the order using the order's own total
    const paymentRes = await squareFetch('/v2/payments', {
      idempotency_key: randomUUID(),
      source_id: sourceId,
      amount_money: {
        amount: orderTotalCents,
        currency: cur,
      },
      location_id: LOCATION_ID,
      order_id: orderId,
      buyer_email_address: customer?.email,
      note: `Order from ${customer?.firstName || ''} ${customer?.lastName || ''} — ${fulfillment || 'pickup'}`.trim(),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error('Square payment error:', paymentData);
      const msg = friendlyPaymentError(paymentData.errors);
      return res.status(400).json({ error: msg, code: paymentData.errors?.[0]?.code });
    }

    return res.status(200).json({
      success: true,
      orderId,
      paymentId: paymentData.payment.id,
      receiptUrl: paymentData.payment.receipt_url,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
}
