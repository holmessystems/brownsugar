import events from '../data/popUpEvents.json';

export default function PopUpCalendar() {
  const validEvents = Array.isArray(events)
    ? events.filter(
        (e) => e && e.location && e.address && e.date && e.time
      )
    : [];

  return (
    <section className="popup-calendar">
      <div className="section-header">
        <p className="section-label">Events</p>
        <h2 className="section-title">Where to Find Us</h2>
      </div>

      {validEvents.length === 0 ? (
        <p className="no-events">No upcoming events</p>
      ) : (
        <div className="events-list">
          {validEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3 className="event-location">{event.location}</h3>
              <p className="event-address">{event.address}</p>
              <p className="event-datetime">
                <span className="event-date">{event.date}</span>
                <span className="event-time">{event.time}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
