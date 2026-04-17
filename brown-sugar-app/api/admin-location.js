const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'brownsugar2025';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth || auth.slice(7) !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const locationId = process.env.VITE_SQUARE_LOCATION_ID;

  try {
    const locRes = await fetch(`${SQUARE_BASE_URL}/v2/locations/${locationId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await locRes.json();

    if (!locRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch location', locationId });
    }

    const loc = data.location;
    return res.status(200).json({
      locationId,
      name: loc.name,
      address: loc.address,
      status: loc.status,
      businessName: loc.business_name,
      businessEmail: loc.business_email,
      phone: loc.phone_number,
    });
  } catch (err) {
    console.error('Location fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch location info', locationId });
  }
}
