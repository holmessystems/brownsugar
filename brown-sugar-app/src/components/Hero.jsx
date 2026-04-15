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
        <p className="hero-subtext">Preorder only — no walk-ins. Pickup in Houston.</p>
        <p className="hero-subtext">Build your custom 4-pack and pick up at your selected time.</p>
        <a href="#products" className="btn-primary hero-cta" onClick={scrollToProducts}>
          BUILD YOUR BOX
        </a>
      </div>
    </section>
  );
}
