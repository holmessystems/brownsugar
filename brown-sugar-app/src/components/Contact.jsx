import { useCart } from '../context/CartContext';

export default function Contact() {
  const { showToast } = useCart();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Message sent! We'll respond within one business day.");
    e.target.reset();
  };

  return (
    <section className="contact" id="contact">
      <p className="section-label">Get In Touch</p>
      <h2>Let's make something <em style={{ fontStyle: 'italic', color: 'var(--tan-dark)' }}>sweet</em></h2>
      <p>Planning an event, want to place a custom order, or just have a question? Reach out and we'll get back to you within one business day.</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Name</label><input type="text" placeholder="Your name" required /></div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="your@email.com" required /></div>
        </div>
        <div className="form-group"><label>Event / Order Details</label><input type="text" placeholder="e.g. Wedding dessert table · June 2025 · 50 guests" /></div>
        <div className="form-group"><label>Message</label><textarea rows="4" placeholder="Tell us what you're looking for..." /></div>
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Send Message</button>
      </form>
    </section>
  );
}
