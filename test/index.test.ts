import { QuantitativeHistogram } from '../src/index';

describe('QuantitativeHistogram', () => {
  test('#constructor works', () => {
    expect(() => {
      const qh = new QuantitativeHistogram(null,null,null);
    }).not.toThrow()
  });
});
