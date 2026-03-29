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

  it('handles setDeep on a Map with a single-element path (length 1)', () => {
    // When parent is a Map and path has length 1, the isMap branch at the end
    // reads path[path.length - 2] = path[-1] = undefined, and +undefined = NaN.
    // This causes getNthKey to receive NaN as the row index, which is a bug.
    const map = new Map([['key1', 'value1']]);

    // path [1] means: lastKey=1 (i.e. "value" type), and row = +path[-1] = NaN
    // The function should either correctly update the value or throw a clear error,
    // but it must not silently produce NaN or corrupt the Map.
    const result = setDeep(map, [1], () => 'updated');

    // If the function handles this correctly, the value of 'key1' should be updated
    expect(result).toBeInstanceOf(Map);
    expect(result.get('key1')).toBe('updated');
    // Ensure no NaN keys were introduced
    for (const key of result.keys()) {
      expect(typeof key === 'number' && isNaN(key)).toBe(false);
    }
  });

  it('handles setDeep on a Map with an empty path (length 0)', () => {
    const map = new Map([['key1', 'value1']]);

    // With an empty path, setDeep returns mapper(object) directly (line 62-64).
    // This should work even when the object is a Map.
    const result = setDeep(map, [], (m: Map<string, string>) => {
      expect(m).toBeInstanceOf(Map);
      return new Map([['key1', 'replaced']]);
    });

    expect(result).toBeInstanceOf(Map);
    expect(result.get('key1')).toBe('replaced');
  });

  it('handles setDeep on an object containing a Map with a single-element path', () => {
    // When obj.a is a Map and we use path ['a'], the loop body doesn't execute
    // (path.length - 1 = 0), so parent = obj (a plain object). lastKey = 'a'.
    // The plain-object branch sets obj['a'] = mapper(obj['a']).
    // Then the isMap(parent) check sees parent=obj which is NOT a Map, so no NaN.
    // But if we wrap it so the parent IS the Map with a short path, the bug appears.
    const obj = { a: new Map([['x', 10]]) };

    // Use path length 3: navigate into obj.a (plain-object), then Map path [0, 1]
    // This is the normal working case with length >= 2 for the Map portion
    setDeep(obj, ['a', 0, 1], () => 42);
    expect(obj.a.get('x')).toBe(42);

    // Now test with a Map as the root object and path length 1
    // This triggers the NaN bug: path[path.length - 2] = path[-1] = undefined
    const map = new Map([['y', 20]]);
    const result = setDeep(map, [0], () => 'newKey');

    // path [0] means lastKey=0 (key type), row = +path[-1] = NaN
    // Should rename the key at row 0, not produce NaN
    expect(result).toBeInstanceOf(Map);
    // Ensure no NaN keys were introduced into the map
    for (const key of result.keys()) {
      expect(typeof key === 'number' && isNaN(key)).toBe(false);
    }
  });

  it('setDeep works correctly for Map paths of length >= 2 (sanity check)', () => {
    const map = new Map([['key1', 'value1']]);

    // path length 2: row=0, type=1 (value) — this is the standard working case
    setDeep(map, [0, 1], () => 'newValue');

    expect(map.get('key1')).toBe('newValue');
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
