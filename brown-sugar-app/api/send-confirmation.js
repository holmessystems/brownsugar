export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { customer, items, subtotal, tax, total, pickupDay, pickupTime, pickupAddress, pickupZip } = req.body;

  if (!customer?.email) {
    return res.status(400).json({ error: 'Missing customer email' });
  }

  const itemRows = (items || []).map(item =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e8d5bc;font-family:'Helvetica',sans-serif;font-size:14px;color:#3a2d24;">
        ${item.name}${item.flavorKey ? `<br><span style="font-size:12px;color:#9a8070;">${item.flavorKey}</span>` : ''}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8d5bc;text-align:center;font-size:14px;color:#6b5344;">×${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8d5bc;text-align:right;font-size:14px;color:#8a5c48;font-weight:600;">$${(item.price * item.qty).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:'Helvetica Neue','Helvetica',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-size:22px;color:#3a2d24;margin:0 0 4px;">Brown Sugar Co.</h1>
      <p style="font-size:13px;color:#9a8070;margin:0;letter-spacing:0.05em;text-transform:uppercase;">Order Confirmation</p>
    </div>

    <div style="background:white;border:1px solid #e8d5bc;border-radius:6px;padding:24px;margin-bottom:20px;">
      <p style="font-size:16px;color:#3a2d24;margin:0 0 4px;">Thank you, ${customer.firstName}!</p>
      <p style="font-size:13px;color:#6b5344;margin:0;">Your preorder has been confirmed.</p>
    </div>

    <div style="background:white;border:1px solid #e8d5bc;border-radius:6px;overflow:hidden;margin-bottom:20px;">
      <div style="background:#8a5c48;padding:10px 16px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:white;">Order Summary</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#faf3e8;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9a8070;text-transform:uppercase;letter-spacing:0.06em;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;color:#9a8070;text-transform:uppercase;letter-spacing:0.06em;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#9a8070;text-transform:uppercase;letter-spacing:0.06em;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <div style="padding:12px 12px 4px;border-top:1px solid #e8d5bc;">
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#6b5344;">
          <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#6b5344;">
          <span>Tax (8.25%)</span><span>$${tax.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 4px;font-size:16px;color:#3a2d24;font-weight:700;border-top:1px solid #e8d5bc;margin-top:6px;">
          <span>Total</span><span>$${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="background:white;border:1px solid #e8d5bc;border-radius:6px;overflow:hidden;margin-bottom:20px;">
      <div style="background:#8a5c48;padding:10px 16px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:white;">Pickup Details</p>
      </div>
      <div style="padding:16px;">
        <table style="width:100%;font-size:14px;color:#3a2d24;">
          ${pickupDay ? `<tr><td style="padding:4px 0;color:#9a8070;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Date</td><td style="padding:4px 0;text-align:right;">${pickupDay}</td></tr>` : ''}
          <tr><td style="padding:4px 0;color:#9a8070;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Time</td><td style="padding:4px 0;text-align:right;">${pickupTime}</td></tr>
          <tr><td style="padding:4px 0;color:#9a8070;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Location</td><td style="padding:4px 0;text-align:right;">${pickupAddress}</td></tr>
          <tr><td style="padding:4px 0;color:#9a8070;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Zip Code</td><td style="padding:4px 0;text-align:right;">${pickupZip}</td></tr>
        </table>
      </div>
    </div>

    <div style="background:#f5ede0;border:1px solid #e8d5bc;border-radius:6px;padding:16px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:600;color:#3a2d24;margin:0 0 8px;">Pickup Instructions</p>
      <ol style="margin:0;padding-left:18px;font-size:13px;color:#6b5344;line-height:1.7;">
        <li>Arrive at the address above at your selected time.</li>
        <li>Remain in your vehicle upon arrival.</li>
        <li>Text us your car make and color so we can find you.</li>
        <li>We'll bring your order directly to your car.</li>
      </ol>
    </div>

    <div style="text-align:center;padding:16px 0;font-size:12px;color:#9a8070;">
      <p style="margin:0 0 4px;">Questions? Email hello@officialbrownsugarco.com</p>
      <p style="margin:0;">Follow us @officialbrownsugarco</p>
      <p style="margin:8px 0 0;font-size:11px;color:#c8a882;">© 2025 Official Brown Sugar Co. · Houston, TX</p>
    </div>

  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Brown Sugar Co. <onboarding@resend.dev>',
        to: customer.email,
        subject: `Order Confirmed — Brown Sugar Co.`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(400).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, emailId: data.id });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }
}
