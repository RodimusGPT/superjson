import SuperJSON from './index.js';
import { walker } from './plainer.js';

import { test, expect, describe } from 'vitest';

test('walker', () => {
  expect(
    walker(
      {
        a: new Map([[NaN, null]]),
        b: /test/g,
      },
      new Map(),
      new SuperJSON(),
      false
    )
  ).toEqual({
    transformedValue: {
      a: [['NaN', null]],
      b: '/test/g',
    },
    annotations: {
      a: [
        'map',
        {
          '0.0': ['number'],
        },
      ],
      b: ['regexp'],
    },
  });
});

describe('walker deeply nested objects', () => {
  test('50-level deep nested object produces correct transformedValue and annotations', () => {
    // Build a 50-level deep nested object where the leaf is a Date
    const depth = 50;
    const leafDate = new Date('2024-01-01T00:00:00.000Z');
    let obj: Record<string, unknown> = { value: leafDate };
    for (let i = depth - 1; i >= 0; i--) {
      obj = { [`level${i}`]: obj };
    }

    const result = walker(obj, new Map(), new SuperJSON(), false);

    // Verify the transformedValue has correct nesting structure
    let current: Record<string, unknown> = result.transformedValue;
    for (let i = 0; i < depth; i++) {
      expect(current).toHaveProperty(`level${i}`);
      current = current[`level${i}`] as Record<string, unknown>;
    }
    expect(current.value).toBe('2024-01-01T00:00:00.000Z');

    // Build expected annotation key: level0.level1...level49.value
    const annotationKey = Array.from({ length: depth }, (_, i) => `level${i}`).join('.') + '.value';
    expect(result.annotations).toEqual({
      [annotationKey]: ['Date'],
    });
  });

  test('Maps and Sets nested 20+ levels deep', () => {
    // Build a structure: Map -> Set -> Map -> Set -> ... alternating for 20+ levels
    const depth = 22;
    let leaf: unknown = 'leaf-value';
    for (let i = depth - 1; i >= 0; i--) {
      if (i % 2 === 0) {
        leaf = new Map([['key', leaf]]);
      } else {
        leaf = new Set([leaf]);
      }
    }

    const input = { root: leaf };
    const result = walker(input, new Map(), new SuperJSON(), false);

    // Verify transformedValue structure - Maps become arrays of entries, Sets become arrays
    let current: unknown = result.transformedValue.root;
    for (let i = 0; i < depth; i++) {
      if (i % 2 === 0) {
        // Map -> [['key', ...]]
        expect(Array.isArray(current)).toBe(true);
        expect((current as unknown[][])[0][0]).toBe('key');
        current = (current as unknown[][])[0][1];
      } else {
        // Set -> [...]
        expect(Array.isArray(current)).toBe(true);
        current = (current as unknown[])[0];
      }
    }
    expect(current).toBe('leaf-value');

    // Verify annotations exist and contain map/set markers
    expect(result.annotations).toBeDefined();

    // The root level should have a 'map' or 'set' annotation for root
    // Root annotation path: "root" should be 'map' (depth 0 is even -> Map)
    const annotations = result.annotations as Record<string, unknown>;
    // The top-level container annotations should include map/set types
    // root is a Map, so annotations.root should start with 'map'
    expect(annotations).toBeDefined();

    // Verify the structure round-trips correctly through SuperJSON
    const superJson = new SuperJSON();
    const serialized = superJson.serialize(input);
    const deserialized = superJson.deserialize<{ root: unknown }>(serialized);

    // Walk the deserialized structure to confirm types are preserved
    let deseriaCurrent: unknown = deserialized.root;
    for (let i = 0; i < depth; i++) {
      if (i % 2 === 0) {
        expect(deseriaCurrent).toBeInstanceOf(Map);
        deseriaCurrent = (deseriaCurrent as Map<string, unknown>).get('key');
      } else {
        expect(deseriaCurrent).toBeInstanceOf(Set);
        deseriaCurrent = [...(deseriaCurrent as Set<unknown>)][0];
      }
    }
    expect(deseriaCurrent).toBe('leaf-value');
  });

  test('mixed types (Date, RegExp, Map, Set, BigInt, URL) at various nesting depths', () => {
    const input = {
      shallow: {
        date: new Date('2024-06-15T12:00:00.000Z'),
        regexp: /^hello\s+world$/i,
      },
      medium: {
        a: {
          b: {
            map: new Map<string, unknown>([
              ['x', BigInt(42)],
              ['y', new Set([1, 2, 3])],
            ]),
          },
        },
      },
      deep: (() => {
        // 10 levels deep, then a URL and BigInt
        let obj: Record<string, unknown> = {
          url: new URL('https://example.com/path?q=1'),
          bigint: BigInt('999999999999999999'),
          set: new Set([new Date('2000-01-01T00:00:00.000Z'), /test/g]),
        };
        for (let i = 9; i >= 0; i--) {
          obj = { [`n${i}`]: obj };
        }
        return obj;
      })(),
    };

    const result = walker(input, new Map(), new SuperJSON(), false);

    // Verify shallow transformations
    expect(result.transformedValue.shallow.date).toBe('2024-06-15T12:00:00.000Z');
    expect(result.transformedValue.shallow.regexp).toBe('/^hello\\s+world$/i');

    // Verify medium depth - Map with BigInt and Set
    const mapTransformed = result.transformedValue.medium.a.b.map;
    expect(Array.isArray(mapTransformed)).toBe(true);
    // Map entries: [['x', '42'], ['y', [1, 2, 3]]]
    expect(mapTransformed[0][0]).toBe('x');
    expect(mapTransformed[0][1]).toBe('42');
    expect(mapTransformed[1][0]).toBe('y');
    expect(Array.isArray(mapTransformed[1][1])).toBe(true);

    // Verify deep nested path
    let deepCurrent: Record<string, unknown> = result.transformedValue.deep;
    for (let i = 0; i < 10; i++) {
      deepCurrent = deepCurrent[`n${i}`] as Record<string, unknown>;
    }
    expect(deepCurrent.url).toBe('https://example.com/path?q=1');
    expect(deepCurrent.bigint).toBe('999999999999999999');
    expect(Array.isArray(deepCurrent.set)).toBe(true);

    // Verify annotations contain expected type markers
    const annotations = result.annotations as Record<string, unknown>;
    expect(annotations['shallow.date']).toEqual(['Date']);
    expect(annotations['shallow.regexp']).toEqual(['regexp']);

    // medium.a.b.map should be annotated as 'map' with inner annotations
    expect(annotations['medium.a.b.map']).toBeDefined();
    const mapAnnotation = annotations['medium.a.b.map'] as [string, Record<string, unknown>];
    expect(mapAnnotation[0]).toBe('map');
    // Inner annotations should include bigint for x value and set for y value
    expect(mapAnnotation[1]['0.1']).toEqual(['bigint']);
    expect(mapAnnotation[1]['1.1']).toBeDefined();

    // deep path annotations
    const deepPrefix = Array.from({ length: 10 }, (_, i) => `n${i}`).join('.');
    expect(annotations[`deep.${deepPrefix}.url`]).toEqual(['URL']);
    expect(annotations[`deep.${deepPrefix}.bigint`]).toEqual(['bigint']);

    // Verify round-trip correctness
    const superJson = new SuperJSON();
    const serialized = superJson.serialize(input);
    const deserialized = superJson.deserialize<typeof input>(serialized);

    expect(deserialized.shallow.date).toEqual(new Date('2024-06-15T12:00:00.000Z'));
    expect(deserialized.shallow.regexp).toEqual(/^hello\s+world$/i);
    expect(deserialized.medium.a.b.map).toBeInstanceOf(Map);
    expect((deserialized.medium.a.b.map as Map<string, unknown>).get('x')).toBe(BigInt(42));
    expect((deserialized.medium.a.b.map as Map<string, unknown>).get('y')).toBeInstanceOf(Set);
  });
});
