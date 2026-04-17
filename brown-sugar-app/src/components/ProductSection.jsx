import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { product, flavors } from '../data/products';

export default function ProductSection() {
  const { addBoxToCart, isDateSoldOut, selectedPickupDate, globalSoldOut } = useCart();
  const [selections, setSelections] = useState(
    Object.fromEntries(flavors.map(f => [f.name, 0]))
  );
  const [builderOpen, setBuilderOpen] = useState(false);

  const soldOut = globalSoldOut || (selectedPickupDate && isDateSoldOut(selectedPickupDate));
  const totalSelected = Object.values(selections).reduce((s, q) => s + q, 0);
  const remaining = product.boxSize - totalSelected;

  const increment = (name) => {
    if (totalSelected >= product.boxSize) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] + 1 }));
  };

  const decrement = (name) => {
    if (selections[name] <= 0) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] - 1 }));
  };

  const resetSelections = () => {
    setSelections(Object.fromEntries(flavors.map(f => [f.name, 0])));
  };

  const handleAddToCart = () => {
    if (totalSelected !== product.boxSize) return;
    addBoxToCart(selections, product);
    resetSelections();
    setBuilderOpen(false);
  };

  return (
    <section id="products" className="product-section">
      <div className="section-header">
        <p className="section-label">Preorder Only</p>
        <h2 className="section-title">
          {product.name} — <em>${product.price}</em>
        </h2>
        <p className="section-sub">{product.description}</p>
      </div>

      {/* Main product image — click to open builder */}
      <div
        className={`box-product-card${soldOut ? ' sold-out-card' : ''}`}
        onClick={() => !soldOut && setBuilderOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={soldOut ? 'Sold out' : 'Customize your 4-pack box'}
      >
        <div className="box-product-img">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <div className="box-product-info">
          <span className="box-product-tag">Customizable 4-Pack</span>
          <p className="box-product-cta">
            {soldOut ? 'Check back for our next drop' : 'Click to build your box →'}
          </p>
        </div>
        {soldOut && (
          <div className="sold-out-overlay">
            <span className="sold-out-badge">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Box builder modal */}
      {builderOpen && (
        <div className="builder-overlay" onClick={() => setBuilderOpen(false)}>
          <div className="builder-modal" onClick={e => e.stopPropagation()}>
            <div className="builder-header">
              <h3>Build Your 4-Pack</h3>
              <button className="close-cart" onClick={() => setBuilderOpen(false)}>✕</button>
            </div>

            <p className="builder-counter">
              {remaining > 0
                ? `Select ${remaining} more roll${remaining > 1 ? 's' : ''}`
                : '✓ Box complete!'}
              <span className="builder-count">{totalSelected} / {product.boxSize}</span>
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
                    <button className="qty-btn" onClick={() => increment(flavor.name)} disabled={totalSelected >= product.boxSize} aria-label={`Add one ${flavor.name}`}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="builder-footer">
              <button className="btn-outline" onClick={resetSelections}>Reset</button>
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={totalSelected !== product.boxSize}
              >
                Add Box to Cart — ${product.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
