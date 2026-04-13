export default function Footer() {
  return (
    <>
      <footer>
        <div>
          <div className="footer-logo">Brown Sugar<span>Co.</span></div>
          <p>Houston's beloved pop-up bakery crafting nostalgic, elevated cinnamon rolls and desserts. Founded by sisters Anna &amp; Toni Perry in honor of their mother's legacy.</p>
          <p style={{ marginTop: '0.8rem' }}>📍 Houston, TX &nbsp;|&nbsp; ✉️ hello@officialbrownsugarco.com</p>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Orders</h4>
          <ul>
            <li><a href="#menu">Cinnamon Rolls</a></li>
            <li><a href="#menu">Roll Boxes</a></li>
            <li><a href="#contact">Custom Orders</a></li>
            <li><a href="#contact">Event Catering</a></li>
          </ul>
        </div>
      </footer>
      <div className="footer-bottom">
        <span>© 2025 Official Brown Sugar Co. LLC · Houston, TX</span>
        <span>Payments secured by Square</span>
      </div>
    </>
  );
}
