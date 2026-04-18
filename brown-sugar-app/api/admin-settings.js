import { put, head } from '@vercel/blob';

const SETTINGS_URL_KEY = 'admin-settings.json';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'brownsugar2025';

const DEFAULT_SETTINGS = {
  soldOut: false,
  orderCount: 0,
  orderLimit: 20,
  pickupDay: '',
  pickupOptions: [
    {
      id: "spring-sun-3pm",
      label: "Spring, TX 77068 — Sunday 4/19 at 3:00 PM",
      date: "Sunday, April 19",
      time: "3:00 PM",
      zip: "77068",
      address: "3140 FM 1960 Rd W, Houston, TX 77068"
    },
    {
      id: "richmond-sun-6pm",
      label: "Richmond, TX 77406 — Sunday 4/19 at 6:00 PM",
      date: "Sunday, April 19",
      time: "6:00 PM",
      zip: "77406",
      address: "7920 W Grand Parkway S, Richmond, TX 77406"
    },
    {
      id: "houston-mon-wed-3pm",
      label: "Houston, TX 77027 — Mon–Wed 4/20–4/22 at 3:00–4:00 PM",
      date: "Mon–Wed, April 20–22",
      time: "3:00–4:00 PM",
      zip: "77027",
      address: "4733 Richmond Ave, Houston, TX 77027"
    }
  ],
  events: [
    {
      id: "1",
      title: "Houston Heights Pop-Up",
      area: "Houston Heights, TX 77008",
      date: "Saturday, May 3, 2025",
      time: "9:00 AM – 1:00 PM",
      type: "One-Day Pop-Up"
    },
    {
      id: "2",
      title: "Midtown Sweet Drop",
      area: "Midtown, Houston, TX 77006",
      date: "Saturday, May 17, 2025",
      time: "10:00 AM – 2:00 PM",
      type: "One-Day Pop-Up"
    },
    {
      id: "3",
      title: "Sugar Land Pop-Up",
      area: "Sugar Land, TX 77479",
      date: "Saturday, June 7, 2025",
      time: "9:00 AM – 12:00 PM",
      type: "Limited-Time Event"
    }
  ],
};

// Store the blob URL after first write so we can read it back
let cachedBlobUrl = null;

async function getSettings() {
  try {
    // Try to read from the known blob URL
    if (cachedBlobUrl) {
      const res = await fetch(cachedBlobUrl);
      if (res.ok) return await res.json();
    }

    // Try head to check if blob exists
    const meta = await head(SETTINGS_URL_KEY, { token: process.env.BLOB_READ_WRITE_TOKEN });
    if (meta?.url) {
      cachedBlobUrl = meta.url;
      const res = await fetch(meta.url);
      if (res.ok) return await res.json();
    }
  } catch (e) {
    // Blob doesn't exist yet, use defaults
    console.log('Settings blob not found, using defaults');
  }
  return { ...DEFAULT_SETTINGS };
}

// Ensure saved settings have all default keys (handles upgrades)
function mergeDefaults(saved) {
  const merged = { ...DEFAULT_SETTINGS, ...saved };
  // Only fill in default pickupOptions if the key doesn't exist at all (pre-upgrade blob)
  if (!('pickupOptions' in saved)) {
    merged.pickupOptions = DEFAULT_SETTINGS.pickupOptions;
  }
  return merged;
}

async function saveSettings(settings) {
  const blob = await put(SETTINGS_URL_KEY, JSON.stringify(settings), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  cachedBlobUrl = blob.url;
  console.log('Settings saved to blob:', blob.url);
  return blob;
}

function checkAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return auth.slice(7) === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — public
  if (req.method === 'GET') {
    const raw = await getSettings();
    const settings = mergeDefaults(raw);
    // Auto sold-out if order count >= limit
    if (settings.orderCount >= settings.orderLimit && !settings.soldOut) {
      settings.soldOut = true;
    }
    return res.status(200).json(settings);
  }

  // POST — protected
  if (req.method === 'POST') {
    if (!checkAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const raw = await getSettings();
    const current = mergeDefaults(raw);
    const { soldOut, events, orderCount, orderLimit, pickupDay, pickupOptions } = req.body;

    if (typeof soldOut === 'boolean') current.soldOut = soldOut;
    if (Array.isArray(events)) current.events = events;
    if (typeof orderCount === 'number') current.orderCount = orderCount;
    if (typeof orderLimit === 'number') current.orderLimit = orderLimit;
    if (typeof pickupDay === 'string') current.pickupDay = pickupDay;
    if (Array.isArray(pickupOptions)) current.pickupOptions = pickupOptions;

    await saveSettings(current);

    return res.status(200).json({ success: true, settings: current });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
