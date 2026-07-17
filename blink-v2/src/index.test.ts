import { boot, moduleIds } from './index';

describe('blink-v2', () => {
  it('boots via home + logger', () => {
    const out = boot();
    expect(out).toContain('blink-v2 booting');
    expect(out).toContain('odd');
  });

  it('plucks module ids', () => {
    expect(moduleIds([{ id: 'home' }, { id: 'admin' }])).toEqual(['home', 'admin']);
  });
});
