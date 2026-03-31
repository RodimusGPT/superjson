import { setDeep, getDeep } from './accessDeep.js';

import { describe, it, expect } from 'vitest';

describe('setDeep', () => {
  it('correctly sets values in maps', () => {
    const obj = {
      a: new Map([[new Set(['NaN']), [[1, 'undefined']]]]),
    };

    setDeep(obj, ['a', 0, 0, 0], Number);
    setDeep(obj, ['a', 0, 1], entries => new Map(entries));
    setDeep(obj, ['a', 0, 1, 0, 1], () => undefined);

    expect(obj).toEqual({
      a: new Map([[new Set([NaN]), new Map([[1, undefined]])]]),
    });
  });

  it('correctly sets values in sets', () => {
    const obj = {
      a: new Set([10, new Set(['NaN'])]),
    };

    setDeep(obj, ['a', 1, 0], Number);

    expect(obj).toEqual({
      a: new Set([10, new Set([NaN])]),
    });
  });
});

describe('getNthKey boundary checks', () => {
  it('throws when accessing index equal to Set size', () => {
    const obj = { a: new Set([10, 20, 30]) };
    expect(() => getDeep(obj, ['a', 3])).toThrow('index out of bounds');
  });

  it('throws when accessing index equal to Map size', () => {
    const obj = { a: new Map([['x', 1], ['y', 2]]) };
    expect(() => getDeep(obj, ['a', 2, 0])).toThrow('index out of bounds');
  });

  it('returns the last valid element of a Set (size - 1)', () => {
    const obj = { a: new Set([10, 20, 30]) };
    const result = getDeep(obj, ['a', 2]);
    expect(result).toBe(30);
  });

  it('returns the last valid key of a Map (size - 1)', () => {
    const obj = { a: new Map([['x', 1], ['y', 2]]) };
    const result = getDeep(obj, ['a', 1, 0]);
    expect(result).toBe('y');
  });
});
