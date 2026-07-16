import { pageTitle, titleMatcher } from './index';

describe('admin', () => {
  it('builds a page title', () => {
    expect(pageTitle('user settings')).toBe('User Settings | Admin');
  });

  it('builds a matcher that matches its title', () => {
    expect(titleMatcher('user settings').test('User Settings | Admin')).toBe(true);
  });
});
