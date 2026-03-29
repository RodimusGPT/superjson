import { setDeep } from './accessDeep.js';

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

  it('throws an informative error when setDeep is called on a Map with a path of length 1', () => {
    const myMap = new Map([['a', 1], ['b', 2]]);
    expect(() => setDeep(myMap, [0], v => v)).toThrow(
      'Map paths in setDeep require at least 2 elements'
    );
  });

  it('throws when setDeep targets a nested Map with a single remaining path element', () => {
    const obj = { m: new Map([['x', 10]]) };
    expect(() => setDeep(obj, ['m', 0], v => v)).toThrow(
      'Map paths in setDeep require at least 2 elements'
    );
  });

  it('handles setDeep on a Set with path length 1 (regression guard)', () => {
    const mySet = new Set(['hello', 'world']);
    setDeep(mySet, [0], v => v.toUpperCase());
    expect(mySet).toEqual(new Set(['HELLO', 'world']));
  });
});
