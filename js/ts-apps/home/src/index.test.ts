import { greet } from './index';

describe('home', () => {
  it('greets with parity', () => {
    const out = greet('spotter', 3);
    expect(out).toContain('Welcome Spotter');
    expect(out).toContain('odd');
  });
});
