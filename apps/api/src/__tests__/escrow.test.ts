import { artisanPayoutAmount } from '../lib/escrow';

describe('Escrow payout calculation', () => {
  it('deducts platform fee from gross amount', () => {
    expect(artisanPayoutAmount(10000)).toBe(8500);
  });

  it('rounds to two decimal places', () => {
    expect(artisanPayoutAmount(3333)).toBe(2833.05);
  });
});
