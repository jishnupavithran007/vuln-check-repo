import { info } from './index';

describe('logger', () => {
  it('prefixes the message', () => {
    expect(info('hi')).toContain('[info] hi');
  });
});
