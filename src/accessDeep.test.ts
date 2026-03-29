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

describe('getNthKey bounds check', () => {
  it('should throw when accessing index equal to Set size', () => {
    const obj = { a: new Set(['x', 'y', 'z']) };
    expect(() => getDeep(obj, ['a', 3])).toThrow('index out of bounds');
  });

  it('should throw when accessing row index equal to Map size', () => {
    const obj = { a: new Map([['k1', 'v1'], ['k2', 'v2']]) };
    expect(() => getDeep(obj, ['a', 2, 0])).toThrow('index out of bounds');
  });

  it('should succeed when accessing the last valid index of a Set', () => {
    const obj = { a: new Set(['x', 'y', 'z']) };
    const result = getDeep(obj, ['a', 2]);
    expect(result).toBe('z');
  });
});
