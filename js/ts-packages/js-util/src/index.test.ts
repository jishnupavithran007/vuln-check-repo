import { titleCase, humanize } from './index';

describe('js-util', () => {
  it('title-cases a string', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('humanizes milliseconds', () => {
    expect(humanize(60000)).toBe('1m');
  });
});
