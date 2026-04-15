import events from '../data/popUpEvents.json';

export default function PopUpCalendar() {
  const validEvents = Array.isArray(events)
    ? events.filter((e) => e && e.title && e.date && e.time)
    : [];

  return (
    <section className="popup-calendar" id="popup-calendar">
      <div className="section-header">
        <p className="section-label">Limited-Time Events</p>
        <h2 className="section-title">Upcoming Pop-Ups</h2>
        <p className="section-sub">
          Each event is a one-day-only pop-up. Preorder is required — no walk-ups.
          Exact location provided after checkout.
        </p>
      </div>

      {validEvents.length === 0 ? (
        <p className="no-events">No upcoming events — check back soon!</p>
      ) : (
        <div className="events-list">
          {validEvents.map((event) => (
            <div key={event.id} className="event-card">
              <span className="event-type-badge">{event.type}</span>
              <h3 className="event-location">{event.title}</h3>
              <p className="event-address">{event.area}</p>
              <p className="event-datetime">
                <span className="event-date">📅 {event.date}</span>
                <span className="event-time">🕐 {event.time}</span>
              </p>
              <p className="event-preorder-note">Preorder required. No walk-ups.</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
