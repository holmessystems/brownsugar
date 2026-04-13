import { useState } from 'react';
import { menuItems } from '../data/menuItems';
import { useCart } from '../context/CartContext';

const filters = [
  { key: 'all', label: 'All Items' },
  { key: 'signature', label: 'Signature' },
  { key: 'seasonal', label: 'Seasonal' },
  { key: 'boxes', label: 'Roll Boxes' },
  { key: 'extras', label: 'Extras' },
];

export default function Menu() {
  const [active, setActive] = useState('all');
  const { addToCart } = useCart();
  const items = active === 'all' ? menuItems : menuItems.filter(i => i.category === active);

  return (
    <section id="menu">
      <div className="section-header">
        <p className="section-label">Order Online</p>
        <h2 className="section-title">The <em>Menu</em></h2>
        <p className="section-sub">Handcrafted cinnamon rolls &amp; desserts · Houston pickup &amp; local delivery</p>
      </div>
      <div className="menu-filters">
        {filters.map(f => (
          <button key={f.key} className={`filter-btn${active === f.key ? ' active' : ''}`} onClick={() => setActive(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="menu-grid">
        {items.map(item => (
          <div className="menu-card" key={item.id}>
            <div className="menu-card-img">
              <div className="food-icon">{item.icon}</div>
              {item.badge && <span className="menu-card-badge">{item.badge}</span>}
            </div>
            <div className="menu-card-body">
              <p className="menu-card-category">{item.category}</p>
              <p className="menu-card-name">{item.name}</p>
              <p className="menu-card-desc">{item.desc}</p>
              <div className="menu-card-footer">
                <div className="menu-price">
                  ${item.price}<span className="per"> / {item.perLabel}</span>
                </div>
                <button className="add-btn" onClick={() => addToCart(item)} title="Add to cart">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
