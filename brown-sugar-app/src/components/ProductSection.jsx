import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { product, flavors } from '../data/products';

export default function ProductSection() {
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const { addToCart, isDateSoldOut, selectedPickupDate } = useCart();

  const soldOut = selectedPickupDate && isDateSoldOut(selectedPickupDate);

  const handleAddToCart = () => {
    if (!selectedFlavor) return;
    addToCart(product, selectedFlavor.name);
  };

  return (
    <section id="products" className="product-section">
      <div className="section-header">
        <p className="section-label">Our Product</p>
        <h2 className="section-title">
          {product.name} — <em>${product.price}</em>
        </h2>
        <p className="section-sub">{product.description}</p>
      </div>

      <p className="flavor-prompt">Select your flavor:</p>

      <div className="flavor-grid">
        {flavors.map((flavor) => (
          <button
            key={flavor.id}
            className={`flavor-card${selectedFlavor?.id === flavor.id ? ' selected' : ''}`}
            onClick={() => setSelectedFlavor(flavor)}
            type="button"
            aria-pressed={selectedFlavor?.id === flavor.id}
          >
            <div className="flavor-card-img">
              <img src={flavor.image} alt={flavor.name} loading="lazy" />
            </div>
            <span className="flavor-card-name">{flavor.name}</span>
          </button>
        ))}
      </div>

      {soldOut && (
        <p className="sold-out-msg">Sold out for this date.</p>
      )}

      <div className="product-actions">
        <button
          className="btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!selectedFlavor || soldOut}
          type="button"
        >
          {soldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </section>
  );
}
