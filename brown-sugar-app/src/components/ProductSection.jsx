import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { product, testProduct, flavors } from '../data/products';

function BoxBuilder({ boxProduct, flavors, addBoxToCart, soldOut, onClose }) {
  const [selections, setSelections] = useState(
    Object.fromEntries(flavors.map(f => [f.name, 0]))
  );

  const totalSelected = Object.values(selections).reduce((s, q) => s + q, 0);
  const remaining = boxProduct.boxSize - totalSelected;

  const increment = (name) => {
    if (totalSelected >= boxProduct.boxSize) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] + 1 }));
  };

  const decrement = (name) => {
    if (selections[name] <= 0) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] - 1 }));
  };

  const reset = () => setSelections(Object.fromEntries(flavors.map(f => [f.name, 0])));

  const handleAdd = () => {
    if (totalSelected !== boxProduct.boxSize) return;
    addBoxToCart(selections, boxProduct);
    reset();
    onClose();
  };

  return (
    <div className="builder-overlay" onClick={onClose}>
      <div className="builder-modal" onClick={e => e.stopPropagation()}>
        <div className="builder-header">
          <h3>{boxProduct.id === 99 ? '⚠️ TEST — ' : ''}Build Your 4-Pack</h3>
          <button className="close-cart" onClick={onClose}>✕</button>
        </div>
        <p className="builder-counter">
          {remaining > 0
            ? `Select ${remaining} more roll${remaining > 1 ? 's' : ''}`
            : '✓ Box complete!'}
          <span className="builder-count">{totalSelected} / {boxProduct.boxSize}</span>
        </p>
        <div className="builder-flavors">
          {flavors.map(flavor => (
            <div key={flavor.id} className={`builder-flavor-row${selections[flavor.name] > 0 ? ' active' : ''}`}>
              <div className="builder-flavor-img">
                <img src={flavor.image} alt={flavor.name} loading="lazy" />
              </div>
              <span className="builder-flavor-name">{flavor.name}</span>
              <div className="builder-qty-controls">
                <button className="qty-btn" onClick={() => decrement(flavor.name)} disabled={selections[flavor.name] <= 0} aria-label={`Remove one ${flavor.name}`}>−</button>
                <span className="qty-display">{selections[flavor.name]}</span>
                <button className="qty-btn" onClick={() => increment(flavor.name)} disabled={totalSelected >= boxProduct.boxSize} aria-label={`Add one ${flavor.name}`}>+</button>
              </div>
            </div>
          ))}
        </div>
        {soldOut && <p className="sold-out-msg">Sold out for this date.</p>}
        <div className="builder-footer">
          <button className="btn-outline" onClick={reset}>Reset</button>
          <button className="btn-primary" onClick={handleAdd} disabled={totalSelected !== boxProduct.boxSize || soldOut}>
            {soldOut ? 'Sold Out' : `Add Box to Cart — $${boxProduct.price}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  const { addBoxToCart, isDateSoldOut, selectedPickupDate } = useCart();
  const [builderOpen, setBuilderOpen] = useState(null); // null | 'main' | 'test'

  const soldOut = selectedPickupDate && isDateSoldOut(selectedPickupDate);

  return (
    <section id="products" className="product-section">
      <div className="section-header">
        <p className="section-label">Preorder Only</p>
        <h2 className="section-title">
          {product.name} — <em>${product.price}</em>
        </h2>
        <p className="section-sub">{product.description}</p>
      </div>

      {/* Main product */}
      <div className="box-product-card" onClick={() => setBuilderOpen('main')} role="button" tabIndex={0} aria-label="Customize your 4-pack box">
        <div className="box-product-img">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <div className="box-product-info">
          <span className="box-product-tag">Customizable 4-Pack</span>
          <p className="box-product-cta">Click to build your box →</p>
        </div>
      </div>

      {/* TODO: Remove test product before launch */}
      <div
        className="box-product-card"
        onClick={() => setBuilderOpen('test')}
        role="button"
        tabIndex={0}
        style={{ border: '2px dashed #856404', maxWidth: 'min(28rem, 90vw)', margin: '0 auto' }}
      >
        <div className="box-product-info" style={{ background: '#fff3cd' }}>
          <span className="box-product-tag" style={{ background: '#856404', color: 'white' }}>⚠️ TEST ONLY — 1¢</span>
          <p className="box-product-cta" style={{ color: '#856404' }}>Click to build test box (1¢) →</p>
          <p style={{ fontSize: '0.7rem', color: '#856404', marginTop: '0.3em' }}>Same 4-pack builder. Remove before launch.</p>
        </div>
      </div>

      {/* Builder modals */}
      {builderOpen === 'main' && (
        <BoxBuilder boxProduct={product} flavors={flavors} addBoxToCart={addBoxToCart} soldOut={soldOut} onClose={() => setBuilderOpen(null)} />
      )}
      {builderOpen === 'test' && (
        <BoxBuilder boxProduct={testProduct} flavors={flavors} addBoxToCart={addBoxToCart} soldOut={soldOut} onClose={() => setBuilderOpen(null)} />
      )}
    </section>
  );
}
