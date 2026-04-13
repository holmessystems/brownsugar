import { randomUUID } from 'crypto';

const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

export default async function handler(req, res) {
  // CORS
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
    // 1. Create the payment
    const paymentRes = await fetch(`${SQUARE_BASE_URL}/v2/payments`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        source_id: sourceId,
        amount_money: {
          amount: Math.round(amount), // amount in cents
          currency: currency || 'USD',
        },
        location_id: process.env.VITE_SQUARE_LOCATION_ID,
        buyer_email_address: customer?.email,
        note: buildOrderNote(cart, fulfillment, customer),
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error('Square payment error:', paymentData);
      const msg = paymentData.errors?.[0]?.detail || 'Payment failed';
      return res.status(400).json({ error: msg });
    }

    return res.status(200).json({
      success: true,
      paymentId: paymentData.payment.id,
      receiptUrl: paymentData.payment.receipt_url,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function buildOrderNote(cart, fulfillment, customer) {
  const lines = (cart || []).map(
    (item) => `${item.qty}x ${item.name} ($${item.price})`
  );
  const parts = [
    `Order from ${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
    `Fulfillment: ${fulfillment || 'pickup'}`,
    customer?.phone ? `Phone: ${customer.phone}` : '',
    customer?.instructions ? `Notes: ${customer.instructions}` : '',
    '---',
    ...lines,
  ];
  return parts.filter(Boolean).join('\n');
}
