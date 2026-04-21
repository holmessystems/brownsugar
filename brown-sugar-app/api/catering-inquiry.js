export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, eventDate, eventType, guestCount, message } = req.body;

  if (!name || !email || !eventDate || !eventType || !guestCount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, eventDate, eventType, guestCount, message }),
      redirect: 'manual',
    });

    // Apps Script returns a 302 redirect after processing the POST.
    // The data is already written to the sheet at this point,
    // so treat 2xx and 3xx as success.
    if (response.status >= 400) {
      const text = await response.text();
      throw new Error(`Sheets error: ${response.status} ${text.slice(0, 200)}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Google Sheets error:', err);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
