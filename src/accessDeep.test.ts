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

describe('getNthKey boundary checks', () => {
  describe('Map', () => {
    it('throws when accessing index equal to map size', () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      // map.size === 2, so index 2 is out of bounds
      expect(() => getDeep(map, [2, 1])).toThrow('index out of bounds');
    });

    it('returns the correct value for the last valid index', () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      // map.size === 2, last valid index is 1
      const value = getDeep(map, [1, 1]);
      expect(value).toBe(2);
    });
  });

  describe('Set', () => {
    it('throws when accessing index equal to set size', () => {
      const set = new Set(['x', 'y', 'z']);
      // set.size === 3, so index 3 is out of bounds
      expect(() => getDeep(set, [3])).toThrow('index out of bounds');
    });

    it('returns the correct value for the last valid index', () => {
      const set = new Set(['x', 'y', 'z']);
      // set.size === 3, last valid index is 2
      const value = getDeep(set, [2]);
      expect(value).toBe('z');
    });
  });

  describe('end-to-end via getDeep', () => {
    it('throws for out-of-bounds Map access nested in an object', () => {
      const obj = { m: new Map([['only', 42]]) };
      // map has size 1, index 1 is out of bounds
      expect(() => getDeep(obj, ['m', 1, 1])).toThrow('index out of bounds');
    });

    it('throws for out-of-bounds Set access nested in an object', () => {
      const obj = { s: new Set([10, 20]) };
      // set has size 2, index 2 is out of bounds
      expect(() => getDeep(obj, ['s', 2])).toThrow('index out of bounds');
    });
  });

  describe('setDeep boundary checks', () => {
    it('throws when setting at out-of-bounds index on a Map', () => {
      const obj = { m: new Map([['a', 1]]) };
      expect(() => setDeep(obj, ['m', 1, 1], () => 99)).toThrow(
        'index out of bounds'
      );
    });

    it('throws when setting at out-of-bounds index on a Set', () => {
      const obj = { s: new Set([10, 20]) };
      expect(() => setDeep(obj, ['s', 2], () => 99)).toThrow(
        'index out of bounds'
      );
    });
  });
});
