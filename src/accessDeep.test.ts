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

describe('getNthKey negative index validation', () => {
  it('getDeep on a Set with a negative index throws', () => {
    const obj = { a: new Set([10, 20, 30]) };
    expect(() => getDeep(obj, ['a', -1])).toThrow('index out of bounds');
  });

  it('getDeep on a Map with a negative row index throws', () => {
    const obj = { a: new Map([['x', 1], ['y', 2]]) };
    expect(() => getDeep(obj, ['a', -1, 1])).toThrow('index out of bounds');
  });

  it('setDeep on a Set with a negative index throws', () => {
    const obj = { a: new Set([10, 20, 30]) };
    expect(() => setDeep(obj, ['a', -1], v => v)).toThrow('index out of bounds');
  });
});
