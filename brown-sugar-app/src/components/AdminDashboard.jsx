import { useState, useEffect, useCallback } from 'react';
import siteConfig from '../data/siteConfig.json';

const EMPTY_EVENT = { id: '', title: '', area: '', date: '', time: '', type: 'One-Day Pop-Up' };
const EMPTY_PICKUP = { id: '', label: '', date: '', time: '', zip: '', address: '' };

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '');
  const [loginError, setLoginError] = useState('');

  // Settings state
  const [soldOut, setSoldOut] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [orderLimit, setOrderLimit] = useState(20);
  const [events, setEvents] = useState([]);
  const [pickupDay, setPickupDay] = useState('');
  const [pickupOptions, setPickupOptions] = useState(siteConfig.pickupOptions || []);

  // UI state
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingPickup, setEditingPickup] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Snapshot of last saved state to detect changes
  const [savedSnapshot, setSavedSnapshot] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin-settings');
      const data = await res.json();
      setSoldOut(data.soldOut ?? false);
      setOrderCount(data.orderCount ?? 0);
      setOrderLimit(data.orderLimit ?? 20);
      setEvents(data.events || []);
      setPickupDay(data.pickupDay || 'Sunday');
      setPickupOptions(Array.isArray(data.pickupOptions) ? data.pickupOptions : siteConfig.pickupOptions || []);
      const snap = JSON.stringify({ soldOut: data.soldOut, orderCount: data.orderCount, orderLimit: data.orderLimit, events: data.events, pickupDay: data.pickupDay, pickupOptions: data.pickupOptions });
      setSavedSnapshot(snap);
      setHasChanges(false);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSettings();
      setLocationLoading(true);
      fetch('/api/admin-location', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setLocation(data))
        .catch(() => {})
        .finally(() => setLocationLoading(false));
    }
  }, [token, fetchSettings]);

  // Track changes
  useEffect(() => {
    const current = JSON.stringify({ soldOut, orderCount, orderLimit, events, pickupDay, pickupOptions });
    setHasChanges(current !== savedSnapshot);
  }, [soldOut, orderCount, orderLimit, events, pickupDay, pickupOptions, savedSnapshot]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        sessionStorage.setItem('admin_token', data.token);
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch {
      setLoginError('Connection error');
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ soldOut, orderCount, orderLimit, events, pickupDay, pickupOptions }),
      });
      if (res.ok) {
        showToast('All changes saved!');
        const snap = JSON.stringify({ soldOut, orderCount, orderLimit, events, pickupDay, pickupOptions });
        setSavedSnapshot(snap);
        setHasChanges(false);
      } else {
        showToast('Save failed');
      }
    } catch {
      showToast('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const saveEvent = (evt) => {
    if (events.find(e => e.id === evt.id)) {
      setEvents(prev => prev.map(e => e.id === evt.id ? evt : e));
    } else {
      setEvents(prev => [...prev, { ...evt, id: String(Date.now()) }]);
    }
    setEditingEvent(null);
  };

  const deletePickup = (id) => {
    setPickupOptions(prev => prev.filter(p => p.id !== id));
  };

  const savePickup = (opt) => {
    // Auto-generate label from fields
    const label = `${opt.address ? opt.address.split(',')[0] : opt.zip} — ${opt.date} at ${opt.time}`;
    const withLabel = { ...opt, label };

    if (pickupOptions.find(p => p.id === opt.id)) {
      setPickupOptions(prev => prev.map(p => p.id === opt.id ? withLabel : p));
    } else {
      setPickupOptions(prev => [...prev, { ...withLabel, id: String(Date.now()) }]);
    }
    setEditingPickup(null);
  };

  const resetOrderCount = () => {
    setOrderCount(0);
    setSoldOut(false);
  };

  const logout = () => {
    setToken('');
    sessionStorage.removeItem('admin_token');
  };

  // Login screen
  if (!token) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <h1 className="admin-title">Brown Sugar Co.</h1>
          <p className="admin-subtitle">Admin Dashboard</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" autoFocus />
            </div>
            {loginError && <p className="field-error">{loginError}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const autoSoldOut = orderCount >= orderLimit;

  // Dashboard
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Brown Sugar Co.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-outline" onClick={logout}>Sign Out</button>
          </div>
        </div>

        {/* Save Bar */}
        {hasChanges && (
          <div className="admin-save-bar">
            <span>You have unsaved changes</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-outline" onClick={fetchSettings} disabled={saving}>Discard</button>
              <button className="btn-primary" onClick={saveAll} disabled={saving}>
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Order Count & Sold Out */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Orders & Availability</h2>
          </div>
          <div className="admin-card-body">
            <div className="order-stats-row">
              <div className="order-stat">
                <span className="order-stat-label">Current Orders</span>
                <div className="order-stat-controls">
                  <button className="qty-btn" onClick={() => setOrderCount(Math.max(0, orderCount - 1))}>−</button>
                  <input
                    type="number"
                    className="order-count-input"
                    value={orderCount}
                    onChange={e => setOrderCount(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                  />
                  <button className="qty-btn" onClick={() => setOrderCount(orderCount + 1)}>+</button>
                </div>
              </div>
              <div className="order-stat">
                <span className="order-stat-label">Order Limit</span>
                <div className="order-stat-controls">
                  <button className="qty-btn" onClick={() => setOrderLimit(Math.max(1, orderLimit - 1))}>−</button>
                  <input
                    type="number"
                    className="order-count-input"
                    value={orderLimit}
                    onChange={e => setOrderLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button className="qty-btn" onClick={() => setOrderLimit(orderLimit + 1)}>+</button>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="order-progress">
              <div className="order-progress-bar" style={{ width: `${Math.min(100, (orderCount / orderLimit) * 100)}%` }} />
              <span className="order-progress-text">{orderCount} / {orderLimit} orders</span>
            </div>

            {autoSoldOut && !soldOut && (
              <p className="auto-sold-out-msg">⚠️ Order limit reached — product will show as sold out automatically.</p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button className="btn-outline" onClick={resetOrderCount}>Reset Order Count</button>
            </div>

            <div className="sold-out-toggle" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--tan-light)' }}>
              <div>
                <p className="toggle-label">Manual Sold Out Override</p>
                <p className="toggle-desc">
                  {soldOut
                    ? 'Manually marked SOLD OUT. Customers cannot order.'
                    : 'Not manually overridden. Availability based on order count.'}
                </p>
              </div>
              <button
                className={`toggle-btn ${soldOut ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setSoldOut(!soldOut)}
                aria-label="Toggle sold out"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        {/* Pickup Day */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Pickup Date</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
              Set the pickup date for this week's orders. The day of the week is calculated automatically and shown to customers during checkout and on receipts.
            </p>
            <div className="form-group">
              <label>Pickup Date</label>
              <input type="date" value={pickupDay} onChange={e => setPickupDay(e.target.value)} />
            </div>
            {pickupDay && (
              <p style={{ fontSize: '0.9rem', color: 'var(--brown)', marginTop: '0.5rem' }}>
                📅 {new Date(pickupDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Pickup Options */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Pickup Options</h2>
            <button className="btn-primary" onClick={() => setEditingPickup({ ...EMPTY_PICKUP })}>+ Add Option</button>
          </div>
          <div className="admin-card-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
              These are the pickup choices customers see at checkout. Each option includes a location, date, and time. Add, edit, or remove options as needed.
            </p>
            {pickupOptions.length === 0 ? (
              <p className="admin-empty">No pickup options configured. Add one above.</p>
            ) : (
              <div className="admin-events-list">
                {pickupOptions.map(opt => (
                  <div key={opt.id} className="admin-event-row">
                    <div className="admin-event-info">
                      <span className="admin-event-title">{opt.date} — {opt.time}</span>
                      <span className="admin-event-meta">{opt.address} ({opt.zip})</span>
                    </div>
                    <div className="admin-event-actions">
                      <button className="btn-outline" onClick={() => setEditingPickup({ ...opt })}>Edit</button>
                      <button className="btn-outline" style={{ color: '#c0392b', borderColor: '#c0392b' }} onClick={() => deletePickup(opt.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Square Location */}        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Square Location</h2>
          </div>
          <div className="admin-card-body">
            {locationLoading ? (
              <p className="admin-empty">Loading location info...</p>
            ) : location?.error ? (
              <p className="admin-empty">Could not load location. ID: <code>{location.locationId}</code></p>
            ) : location ? (
              <div className="location-info">
                <div className="location-detail-grid">
                  <div className="location-detail">
                    <span className="location-label">Name</span>
                    <span className="location-value">{location.name}</span>
                  </div>
                  <div className="location-detail">
                    <span className="location-label">Status</span>
                    <span className={`location-status ${location.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>{location.status}</span>
                  </div>
                  <div className="location-detail">
                    <span className="location-label">Address</span>
                    <span className="location-value">{location.address?.address_line_1}, {location.address?.locality}, {location.address?.administrative_district_level_1} {location.address?.postal_code}</span>
                  </div>
                  <div className="location-detail">
                    <span className="location-label">Location ID</span>
                    <code className="location-code">{location.locationId}</code>
                  </div>
                </div>
                <div className="location-note">
                  <p>Orders are processed under this location. To change it, update the address in your <a href="https://squareup.com/dashboard/locations" target="_blank" rel="noopener noreferrer">Square Dashboard → Locations</a>, or contact your developer to switch location IDs.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Events Management */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Pop-Up Events</h2>
            <button className="btn-primary" onClick={() => setEditingEvent({ ...EMPTY_EVENT })}>+ Add Event</button>
          </div>
          <div className="admin-card-body">
            {events.length === 0 ? (
              <p className="admin-empty">No events yet.</p>
            ) : (
              <div className="admin-events-list">
                {events.map(evt => (
                  <div key={evt.id} className="admin-event-row">
                    <div className="admin-event-info">
                      <span className="admin-event-title">{evt.title}</span>
                      <span className="admin-event-meta">{evt.date} · {evt.time} · {evt.area}</span>
                    </div>
                    <div className="admin-event-actions">
                      <button className="btn-outline" onClick={() => setEditingEvent({ ...evt })}>Edit</button>
                      <button className="btn-outline" style={{ color: '#c0392b', borderColor: '#c0392b' }} onClick={() => deleteEvent(evt.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {editingEvent && (
          <EventEditor event={editingEvent} onSave={saveEvent} onCancel={() => setEditingEvent(null)} />
        )}

        {editingPickup && (
          <PickupEditor pickup={editingPickup} onSave={savePickup} onCancel={() => setEditingPickup(null)} />
        )}
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}

function EventEditor({ event, onSave, onCancel }) {
  const [form, setForm] = useState(event);
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '28rem' }}>
        <div className="modal-header">
          <h3>{event.id ? 'Edit Event' : 'Add Event'}</h3>
          <button className="close-cart" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Event Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Houston Heights Pop-Up" />
            </div>
            <div className="form-group">
              <label>Area / Location</label>
              <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Houston Heights, TX 77008" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input value={form.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Saturday, May 3, 2025" />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 9:00 AM – 1:00 PM" />
              </div>
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="One-Day Pop-Up">One-Day Pop-Up</option>
                <option value="Limited-Time Event">Limited-Time Event</option>
                <option value="Special Event">Special Event</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PickupEditor({ pickup, onSave, onCancel }) {
  const [form, setForm] = useState(pickup);
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.zip) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '28rem' }}>
        <div className="modal-header">
          <h3>{pickup.id ? 'Edit Pickup Option' : 'Add Pickup Option'}</h3>
          <button className="close-cart" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Date *</label>
              <input value={form.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Sunday, April 19" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Time *</label>
                <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 3:00 PM" />
              </div>
              <div className="form-group">
                <label>Zip Code *</label>
                <input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="e.g. 77068" />
              </div>
            </div>
            <div className="form-group">
              <label>Full Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 3140 FM 1960 Rd W, Houston, TX 77068" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save Pickup Option</button>
          </div>
        </form>
      </div>
    </div>
  );
}
