export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-left">
        <p className="hero-eyebrow">Houston, Texas · Pop-Up Bakery</p>
        <h1 className="hero-title">Cinnamon rolls,<br /><em>elevated.</em></h1>
        <p className="hero-sub">
          Nostalgic, handcrafted cinnamon rolls and elevated desserts made with love by sisters Anna &amp; Toni Perry. From our family's kitchen to your most meaningful moments.
        </p>
        <div className="hero-actions">
          <a href="#menu" className="btn-primary">Order Rolls</a>
          <a href="#about" className="btn-outline">Our Story</a>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-visual">
          <div className="hero-visual-bg" />
          <div className="hero-circle-accent" />
          <div className="hero-circle-accent-sm" />

          <p className="hero-cards-label">Try our favorites</p>

          <div className="hero-feature-cards">
            <a href="#menu" className="hero-card hero-card--featured">
              <span className="hero-card-icon">🍥</span>
              <div>
                <p className="hero-card-title">Classic Brown Sugar Roll</p>
                <p className="hero-card-sub">Our #1 bestseller</p>
              </div>
            </a>
            <a href="#menu" className="hero-card">
              <span className="hero-card-icon">🥜</span>
              <div>
                <p className="hero-card-title">Pecan Praline Roll</p>
                <p className="hero-card-sub">Texas-inspired favorite</p>
              </div>
            </a>
            <a href="#menu" className="hero-card">
              <span className="hero-card-icon">🍓</span>
              <div>
                <p className="hero-card-title">Strawberry Cheesecake</p>
                <p className="hero-card-sub">Fan favorite flavor</p>
              </div>
            </a>
          </div>

          <div className="hero-bottom-group">
            <p className="hero-float-text">Baked with love</p>
            <div className="hero-badge">
              <p>Available For</p>
              <strong>Pickup &amp; Local Delivery</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
