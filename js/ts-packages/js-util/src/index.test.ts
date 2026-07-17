import { titleCase, humanize, pluckNames, hasValue } from './index';

describe('js-util', () => {
  it('title-cases a string', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('humanizes milliseconds', () => {
    expect(humanize(60000)).toBe('1m');
  });

  it('plucks a field from a list', () => {
    expect(pluckNames([{ name: 'a' }, { name: 'b' }])).toEqual(['a', 'b']);
  });

  it('checks membership', () => {
    expect(hasValue([1, 2, 3], 2)).toBe(true);
  });
});
