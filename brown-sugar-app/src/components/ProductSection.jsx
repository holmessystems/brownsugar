import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductSection() {
  const { addBoxToCart, isDateSoldOut, selectedPickupDate, globalSoldOut, liveProducts, liveFlavors } = useCart();
  const [activeProduct, setActiveProduct] = useState(null);
  const [selections, setSelections] = useState({});

  const soldOut = globalSoldOut || (selectedPickupDate && isDateSoldOut(selectedPickupDate));

  const openBuilder = (product) => {
    if (soldOut) return;
    setActiveProduct(product);
    setSelections(Object.fromEntries(liveFlavors.map(f => [f.name, 0])));
  };

  const closeBuilder = () => {
    setActiveProduct(null);
    setSelections({});
  };

  const totalSelected = Object.values(selections).reduce((s, q) => s + q, 0);
  const remaining = activeProduct ? activeProduct.boxSize - totalSelected : 0;

  const increment = (name) => {
    if (!activeProduct || totalSelected >= activeProduct.boxSize) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] + 1 }));
  };

  const decrement = (name) => {
    if (selections[name] <= 0) return;
    setSelections(prev => ({ ...prev, [name]: prev[name] - 1 }));
  };

  const resetSelections = () => {
    setSelections(Object.fromEntries(liveFlavors.map(f => [f.name, 0])));
  };

  const handleAddToCart = () => {
    if (!activeProduct || totalSelected !== activeProduct.boxSize) return;
    addBoxToCart(selections, activeProduct);
    closeBuilder();
  };

  return (
    <section id="products" className="product-section">
      <div className="section-header">
        <p className="section-label">Preorder Only</p>
        <h2 className="section-title">Build Your Box</h2>
        <p className="section-sub">Fresh, handcrafted cinnamon rolls. Mix &amp; match your favorite flavors.</p>
      </div>

      <div className="product-cards-grid">
        {liveProducts.map(prod => (
          <div
            key={prod.id}
            className={`box-product-card${soldOut ? ' sold-out-card' : ''}`}
            onClick={() => openBuilder(prod)}
            role="button"
            tabIndex={0}
            aria-label={soldOut ? 'Sold out' : `Customize your ${prod.boxSize}-pack box`}
          >
            <div className="box-product-img">
              <img src={prod.image} alt={prod.name} loading="lazy" />
            </div>
            <div className="box-product-info">
              <span className="box-product-tag">Customizable {prod.boxSize}-Pack — ${prod.price}</span>
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
        ))}
      </div>

      {/* Box builder modal */}
      {activeProduct && (
        <div className="builder-overlay" onClick={closeBuilder}>
          <div className="builder-modal" onClick={e => e.stopPropagation()}>
            <div className="builder-header">
              <h3>Build Your {activeProduct.boxSize}-Pack</h3>
              <button className="close-cart" onClick={closeBuilder}>✕</button>
            </div>

            <p className="builder-counter">
              {remaining > 0
                ? `Select ${remaining} more roll${remaining > 1 ? 's' : ''}`
                : '✓ Box complete!'}
              <span className="builder-count">{totalSelected} / {activeProduct.boxSize}</span>
            </p>

            <div className="builder-flavors">
              {liveFlavors.map(flavor => (
                <div key={flavor.id} className={`builder-flavor-row${selections[flavor.name] > 0 ? ' active' : ''}`}>
                  <div className="builder-flavor-img">
                    <img src={flavor.image} alt={flavor.name} loading="lazy" />
                  </div>
                  <span className="builder-flavor-name">{flavor.name}</span>
                  <div className="builder-qty-controls">
                    <button className="qty-btn" onClick={() => decrement(flavor.name)} disabled={selections[flavor.name] <= 0} aria-label={`Remove one ${flavor.name}`}>−</button>
                    <span className="qty-display">{selections[flavor.name]}</span>
                    <button className="qty-btn" onClick={() => increment(flavor.name)} disabled={totalSelected >= activeProduct.boxSize} aria-label={`Add one ${flavor.name}`}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="builder-footer">
              <button className="btn-outline" onClick={resetSelections}>Reset</button>
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={totalSelected !== activeProduct.boxSize}
              >
                Add Box to Cart — ${activeProduct.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
