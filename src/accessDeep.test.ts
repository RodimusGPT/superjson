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
  it('should throw when accessing a Set element at index === set.size', () => {
    const set = new Set([1, 2, 3]);
    expect(() => getDeep(set, ['3'])).toThrow('index out of bounds');
  });

  it('should throw when accessing a Map key at row === map.size', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    expect(() => getDeep(map, ['2', '0'])).toThrow('index out of bounds');
  });

  it('should return the correct value when accessing at the last valid index', () => {
    const set = new Set([1, 2, 3]);
    expect(getDeep(set, ['2'])).toBe(3);

    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    expect(getDeep(map, ['1', '0'])).toBe('b');
  });
});
