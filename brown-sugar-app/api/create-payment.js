import { randomUUID } from 'crypto';

const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

const SQUARE_VERSION = '2024-01-18';
const LOCATION_ID = process.env.VITE_SQUARE_LOCATION_ID;

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sourceId, amount, currency, customer, cart, fulfillment } = req.body;

  if (!sourceId || !amount) {
    return res.status(400).json({ error: 'Missing sourceId or amount' });
  }

  try {
    // 1. Create the order with line items
    const lineItems = (cart || []).map(item => ({
      name: item.flavorKey
        ? `${item.name} (${item.flavorKey})`
        : item.name,
      quantity: String(item.qty),
      base_price_money: {
        amount: Math.round(item.price * 100),
        currency: currency || 'USD',
      },
    }));

    // Build pickup fulfillment
    const pickupAt = new Date();
    pickupAt.setDate(pickupAt.getDate() + 1); // default to tomorrow
    const fulfillmentDetails = {
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
          email_address: customer?.email || '',
          phone_number: customer?.phone || '',
        },
        note: customer?.instructions || '',
        schedule_type: 'SCHEDULED',
        pickup_at: pickupAt.toISOString(),
      },
    };

    const orderRes = await squareFetch('/v2/orders', {
      idempotency_key: randomUUID(),
      order: {
        location_id: LOCATION_ID,
        line_items: lineItems,
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

    // 2. Create the payment linked to the order
    const paymentRes = await squareFetch('/v2/payments', {
      idempotency_key: randomUUID(),
      source_id: sourceId,
      amount_money: {
        amount: Math.round(amount),
        currency: currency || 'USD',
      },
      location_id: LOCATION_ID,
      order_id: orderId,
      buyer_email_address: customer?.email,
      note: `Order from ${customer?.firstName || ''} ${customer?.lastName || ''} — ${fulfillment || 'pickup'}`.trim(),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error('Square payment error:', paymentData);
      const msg = paymentData.errors?.[0]?.detail || 'Payment failed';
      return res.status(400).json({ error: msg });
    }

    return res.status(200).json({
      success: true,
      orderId,
      paymentId: paymentData.payment.id,
      receiptUrl: paymentData.payment.receipt_url,
    });

    // Note: order count is incremented via the admin-settings API from the frontend
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
