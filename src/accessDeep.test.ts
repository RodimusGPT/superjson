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

  it('sets a value in a plain object', () => {
    const obj = { x: 1, y: 2 };
    setDeep(obj, ['x'], (v: number) => v + 10);
    expect(obj).toEqual({ x: 11, y: 2 });
  });

  it('sets a value in an array', () => {
    const obj = { items: [10, 20, 30] };
    setDeep(obj, ['items', 1], (v: number) => v * 2);
    expect(obj).toEqual({ items: [10, 40, 30] });
  });

  it('sets a value in a set', () => {
    const obj = { s: new Set(['a', 'b', 'c']) };
    setDeep(obj, ['s', 1], (v: string) => v.toUpperCase());
    expect(obj).toEqual({ s: new Set(['a', 'B', 'c']) });
  });

  it('sets a map value', () => {
    const obj = { m: new Map([['key1', 'val1']]) };
    setDeep(obj, ['m', 0, 1], () => 'updated');
    expect(obj).toEqual({ m: new Map([['key1', 'updated']]) });
  });

  it('sets a map key', () => {
    const obj = { m: new Map([['oldKey', 'val']]) };
    setDeep(obj, ['m', 0, 0], () => 'newKey');
    expect(obj).toEqual({ m: new Map([['newKey', 'val']]) });
  });

  it('traverses all four container types in a deeply nested structure', () => {
    const obj = {
      arr: [
        {
          map: new Map([['k', new Set(['hello'])]]),
        },
      ],
    };

    // PlainObject -> Array -> PlainObject -> Map (value) -> Set
    // path: 'arr' (obj), 0 (arr), 'map' (plainobj), 0 (map row), 1 (map value=Set), 0 (set index)
    setDeep(obj, ['arr', 0, 'map', 0, 1, 0], (v: string) => v.toUpperCase());

    expect(obj).toEqual({
      arr: [
        {
          map: new Map([['k', new Set(['HELLO'])]]),
        },
      ],
    });
  });

  it('handles path of length 0 by applying mapper to root', () => {
    const result = setDeep(42, [], (v: number) => v * 2);
    expect(result).toBe(84);
  });

  it('sets a set element without change when mapper returns same value', () => {
    const obj = { s: new Set([1, 2, 3]) };
    setDeep(obj, ['s', 0], (v: number) => v);
    expect(obj).toEqual({ s: new Set([1, 2, 3]) });
  });

  it('sets a map key without change when mapper returns same key', () => {
    const obj = { m: new Map([['same', 'val']]) };
    setDeep(obj, ['m', 0, 0], (v: string) => v);
    expect(obj).toEqual({ m: new Map([['same', 'val']]) });
  });

  it('traverses through a set to reach a nested object', () => {
    const inner = { value: 'original' };
    const obj = { s: new Set([inner]) };
    setDeep(obj, ['s', 0, 'value'], () => 'modified');
    expect(obj).toEqual({ s: new Set([{ value: 'modified' }]) });
  });

  it('traverses through an array to reach a nested set', () => {
    const obj = [new Set(['a', 'b'])];
    setDeep(obj, [0, 1], () => 'B');
    expect(obj).toEqual([new Set(['a', 'B'])]);
  });

  it('traverses map key branch to set nested value', () => {
    const keyObj = { id: 1 };
    const obj = { m: new Map([[keyObj, 'val']]) };
    // navigate to map row 0, key (0), then property 'id'
    setDeep(obj, ['m', 0, 0, 'id'], () => 999);
    expect(keyObj.id).toBe(999);
  });

  it('returns the original root object', () => {
    const obj = { a: [1, 2] };
    const result = setDeep(obj, ['a', 0], () => 99);
    expect(result).toBe(obj);
    expect(obj.a[0]).toBe(99);
  });
});
