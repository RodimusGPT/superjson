import { getDeep, setDeep } from './accessDeep.js';

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

describe('getNthKey bounds checking', () => {
  it('throws when accessing index === set.size via getDeep', () => {
    const set = new Set(['a', 'b', 'c']);
    expect(() => getDeep(set, [3])).toThrow('index out of bounds');
  });

  it('throws when accessing index === map.size via getDeep', () => {
    const map = new Map([
      ['x', 1],
      ['y', 2],
    ]);
    expect(() => getDeep(map, [2, 0])).toThrow('index out of bounds');
  });

  it('throws when passing a negative index on a Set via getDeep', () => {
    const set = new Set(['a', 'b']);
    expect(() => getDeep(set, [-1])).toThrow('index out of bounds');
  });

  it('throws when passing a negative index on a Map via getDeep', () => {
    const map = new Map([['x', 1]]);
    expect(() => getDeep(map, [-1, 0])).toThrow('index out of bounds');
  });

  it('throws when accessing index === set.size via setDeep', () => {
    const set = new Set(['a', 'b', 'c']);
    expect(() => setDeep(set, [3], v => v)).toThrow('index out of bounds');
  });

  it('throws when accessing index === map.size via setDeep', () => {
    const map = new Map([
      ['x', 1],
      ['y', 2],
    ]);
    expect(() => setDeep(map, [2, 0], v => v)).toThrow('index out of bounds');
  });

  it('succeeds when accessing valid indices on a Set', () => {
    const set = new Set(['a', 'b', 'c']);
    expect(getDeep(set, [0])).toBe('a');
    expect(getDeep(set, [2])).toBe('c');
  });

  it('succeeds when accessing valid indices on a Map', () => {
    const map = new Map([
      ['x', 10],
      ['y', 20],
    ]);
    expect(getDeep(map, [0, 0])).toBe('x');
    expect(getDeep(map, [1, 1])).toBe(20);
  });
});
