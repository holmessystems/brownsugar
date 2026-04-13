export default function Hero() {
  const scrollToProducts = (e) => {
    e.preventDefault();
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="hero"
      id="home"
      style={{ backgroundImage: `url(/images/h1.jpg)` }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">Fresh Cinnamon Rolls. Limited Daily Batches.</h1>
        <p className="hero-subtext">Preorder only. Pickup in Houston.</p>
        <p className="hero-subtext">Mobile bakery operating from a commercial kitchen.</p>
        <a href="#products" className="btn-primary hero-cta" onClick={scrollToProducts}>
          PREORDER FOR PICKUP
        </a>
      </div>
    </section>
  );
}
