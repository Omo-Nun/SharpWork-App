import { passesConfidenceThreshold } from '../utils/smileIdentity';

describe('Smile Identity confidence threshold', () => {
  it('requires at least 80% confidence', () => {
    expect(passesConfidenceThreshold(80)).toBe(true);
    expect(passesConfidenceThreshold(79)).toBe(false);
    expect(passesConfidenceThreshold(95)).toBe(true);
  });
});
