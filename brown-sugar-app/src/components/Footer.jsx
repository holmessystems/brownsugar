export default function Footer() {
  return (
    <>
      <footer>
        <div>
          <a href="#home" className="footer-logo">
            <img src="/images/logo-trans.png" alt="Brown Sugar Co." className="footer-logo-img" />
          </a>
          <p>Houston's beloved pop-up bakery crafting nostalgic, elevated cinnamon rolls and desserts. Founded by sisters Anna &amp; Toni Perry in honor of their mother's legacy.</p>
          <p style={{ marginTop: 'var(--space-sm)' }}>📍 Houston, TX &nbsp;|&nbsp; ✉️ info@officialbrownsugarco.com</p>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Build Your Box</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#catering">Catering</a></li>
          </ul>
        </div>
        <div>
          <h4>Orders</h4>
          <ul>
            <li><a href="#products">Cinnamon Roll Box</a></li>
            <li><a href="#catering">Catering</a></li>
            <li><a href="#popup-calendar">Upcoming Pop-Ups</a></li>
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
