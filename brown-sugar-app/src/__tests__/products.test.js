import { describe, it, expect } from 'vitest';
import { product, products, flavors } from '../data/products';

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

describe('Products array (multi-pack support)', () => {
  it('exports a products array with at least 2 entries', () => {
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  it('every product has required fields with correct types', () => {
    for (const p of products) {
      expect(typeof p.id).toBe('number');
      expect(typeof p.name).toBe('string');
      expect(p.price).toBeGreaterThan(0);
      expect(p.boxSize).toBeGreaterThan(0);
      expect(typeof p.description).toBe('string');
      expect(typeof p.image).toBe('string');
    }
  });

  it('all product ids are unique', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes a 4-pack product', () => {
    const fourPack = products.find((p) => p.boxSize === 4);
    expect(fourPack).toBeDefined();
    expect(fourPack.price).toBe(30);
  });

  it('includes a 6-pack product', () => {
    const sixPack = products.find((p) => p.boxSize === 6);
    expect(sixPack).toBeDefined();
    expect(sixPack.price).toBe(42);
  });

  it('6-pack price is greater than 4-pack price', () => {
    const fourPack = products.find((p) => p.boxSize === 4);
    const sixPack = products.find((p) => p.boxSize === 6);
    expect(sixPack.price).toBeGreaterThan(fourPack.price);
  });

  it('legacy product export is the first product in the array', () => {
    expect(product).toEqual(products[0]);
  });
});
