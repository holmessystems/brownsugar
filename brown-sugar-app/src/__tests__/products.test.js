import { describe, it, expect } from 'vitest';
import { product, flavors } from '../data/products';

describe('Product data integrity', () => {
  it('product has numeric id, string name, price > 0, boxSize > 0, string description, string image', () => {
    expect(typeof product.id).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(product.price).toBeGreaterThan(0);
    expect(product.boxSize).toBeGreaterThan(0);
    expect(typeof product.description).toBe('string');
    expect(typeof product.image).toBe('string');
  });

  it('flavors array has at least one entry', () => {
    expect(flavors.length).toBeGreaterThanOrEqual(1);
  });

  it('every flavor has string id, string name, string image', () => {
    for (const flavor of flavors) {
      expect(typeof flavor.id).toBe('string');
      expect(typeof flavor.name).toBe('string');
      expect(typeof flavor.image).toBe('string');
    }
  });

  it('all flavor ids are unique', () => {
    const ids = flavors.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
