import { useState } from 'react';
import { useCart } from '../context/CartContext';

const initialForm = {
  name: '',
  email: '',
  eventDate: '',
  eventType: '',
  guestCount: '',
  message: '',
};

const requiredFields = ['name', 'email', 'eventDate', 'eventType', 'guestCount'];

const fieldLabels = {
  name: 'Name',
  email: 'Email',
  eventDate: 'Event Date',
  eventType: 'Event Type',
  guestCount: 'Guest Count',
};

export default function CateringEvents() {
  const { showToast } = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    for (const field of requiredFields) {
      if (!form[field] || !form[field].trim()) {
        newErrors[field] = `${fieldLabels[field]} is required`;
      }
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
    setForm(initialForm);
    showToast('Catering inquiry submitted! We will be in touch soon.');
  };

  return (
    <section id="catering" className="catering-events">
      <div className="section-header">
        <p className="section-label">Private Events</p>
        <h2 className="section-title">Catering &amp; Events</h2>
        <p className="section-sub">
          Brown Sugar Co. offers catering for events, parties, and private
          gatherings. Let us bring the sweetness to your next occasion.
        </p>
      </div>

      <div className="catering-details">
        <div className="catering-info">
          <h3>Perfect For</h3>
          <ul className="occasions-list">
            <li>Birthdays</li>
            <li>Bridal showers</li>
            <li>Corporate events</li>
            <li>Pop-ups</li>
          </ul>

          <h3>Menu Options</h3>
          <ul className="menu-options-list">
            <li>Cinnamon roll assortments</li>
            <li>Cookies</li>
            <li>Custom quantities</li>
          </ul>
        </div>

        <form className="catering-form" onSubmit={handleSubmit} noValidate>
          <h3>Submit a Catering Inquiry</h3>

          <div className="form-group">
            <label htmlFor="catering-name">Name *</label>
            <input
              id="catering-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="catering-email">Email *</label>
            <input
              id="catering-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="catering-event-date">Event Date *</label>
              <input
                id="catering-event-date"
                name="eventDate"
                type="date"
                value={form.eventDate}
                onChange={handleChange}
                aria-invalid={!!errors.eventDate}
              />
              {errors.eventDate && <span className="field-error">{errors.eventDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="catering-event-type">Event Type *</label>
              <select
                id="catering-event-type"
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                aria-invalid={!!errors.eventType}
              >
                <option value="">Select type</option>
                <option value="birthday">Birthday</option>
                <option value="bridal-shower">Bridal Shower</option>
                <option value="corporate">Corporate Event</option>
                <option value="popup">Pop-up</option>
                <option value="other">Other</option>
              </select>
              {errors.eventType && <span className="field-error">{errors.eventType}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="catering-guest-count">Guest Count *</label>
            <input
              id="catering-guest-count"
              name="guestCount"
              type="number"
              min="1"
              value={form.guestCount}
              onChange={handleChange}
              aria-invalid={!!errors.guestCount}
            />
            {errors.guestCount && <span className="field-error">{errors.guestCount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="catering-message">Message</label>
            <textarea
              id="catering-message"
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary">
            Submit a Catering Inquiry
          </button>
        </form>
      </div>
    </section>
  );
}
