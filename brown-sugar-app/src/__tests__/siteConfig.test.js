import { describe, it, expect } from 'vitest';
import siteConfig from '../data/siteConfig.json';

describe('Site config integrity', () => {
  it('dailyOrderCap is a positive integer', () => {
    expect(Number.isInteger(siteConfig.dailyOrderCap)).toBe(true);
    expect(siteConfig.dailyOrderCap).toBeGreaterThan(0);
  });

  it('pickupOptions entries have string id, label, date, time, zip, address', () => {
    for (const opt of siteConfig.pickupOptions) {
      expect(typeof opt.id).toBe('string');
      expect(typeof opt.label).toBe('string');
      expect(typeof opt.date).toBe('string');
      expect(typeof opt.time).toBe('string');
      expect(typeof opt.zip).toBe('string');
      expect(typeof opt.address).toBe('string');
    }
  });

  it('all pickupOption ids are unique', () => {
    const ids = siteConfig.pickupOptions.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
