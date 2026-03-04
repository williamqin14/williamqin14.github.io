const { calculate } = require('./app');

describe('calculate', () => {
  test('adds numbers', () => {
    expect(calculate({ a: 4, b: 6, operator: '+' })).toBe(10);
  });

  test('subtracts numbers', () => {
    expect(calculate({ a: 10, b: 3, operator: '-' })).toBe(7);
  });

  test('multiplies numbers', () => {
    expect(calculate({ a: 2, b: 8, operator: '*' })).toBe(16);
  });

  test('divides numbers', () => {
    expect(calculate({ a: 20, b: 5, operator: '/' })).toBe(4);
  });

  test('throws for division by zero', () => {
    expect(() => calculate({ a: 1, b: 0, operator: '/' })).toThrow('Cannot divide by zero.');
  });
});
