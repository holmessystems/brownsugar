export default function About() {
  return (
    <section className="about" id="about">
      <div>
        <p className="about-label">Our Story</p>
        <h2>Sweetness that brings people <em>together</em></h2>
        <p>Brown Sugar Co. was born from a Houston kitchen and a mother's legacy. Founded by sisters Anna and Toni Perry, every roll we bake carries the warmth of family tradition and the belief that great desserts create lasting memories.</p>
        <p>We craft nostalgic, elevated desserts that honor tradition while embracing modern sophistication — from our signature cinnamon rolls to seasonal creations that keep Houston coming back for more.</p>
        <div className="about-stats">
          <div className="stat"><span className="num">2</span><span className="lbl">Sister Founders</span></div>
          <div className="stat"><span className="num">5★</span><span className="lbl">Avg. Rating</span></div>
          <div className="stat"><span className="num">HTX</span><span className="lbl">Proudly Local</span></div>
        </div>
      </div>
      <div>
        <div className="about-visual">
          <div>
            <span className="about-tag">What We Offer</span>
            <h3 style={{ marginTop: '0.8rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--text-dark)' }}>Handcrafted rolls &amp; elevated desserts</h3>
          </div>
          <ul className="service-list">
            <li>Signature &amp; seasonal cinnamon rolls</li>
            <li>Wedding &amp; event dessert spreads</li>
            <li>Corporate gifting &amp; office treats</li>
            <li>Birthday &amp; celebration boxes</li>
            <li>Pop-up events across Houston</li>
            <li>Custom orders &amp; catering platters</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
