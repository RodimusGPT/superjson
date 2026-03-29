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

describe('walker with deeply nested structures', () => {
  test('deeply nested plain object (12 levels)', () => {
    // Build a 12-level nested plain object with a Date at the leaf
    const deepDate = new Date('2024-01-01T00:00:00.000Z');
    const input = {
      l1: {
        l2: {
          l3: {
            l4: {
              l5: {
                l6: {
                  l7: {
                    l8: {
                      l9: {
                        l10: {
                          l11: {
                            l12: {
                              value: 'leaf',
                              date: deepDate,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = walker(input, new Map(), new SuperJSON(), false);

    // transformedValue should preserve structure with date serialized as ISO string
    expect(
      result.transformedValue.l1.l2.l3.l4.l5.l6.l7.l8.l9.l10.l11.l12.value
    ).toBe('leaf');
    expect(
      result.transformedValue.l1.l2.l3.l4.l5.l6.l7.l8.l9.l10.l11.l12.date
    ).toBe('2024-01-01T00:00:00.000Z');

    // The date annotation should exist at the correct deep path
    expect(result.annotations).toEqual({
      'l1.l2.l3.l4.l5.l6.l7.l8.l9.l10.l11.l12.date': ['Date'],
    });
  });

  test('deeply nested structure mixing Maps, Sets, arrays, and objects', () => {
    const input = {
      obj: {
        arr: [
          new Map([
            [
              'key',
              new Set([
                {
                  inner: [
                    new Map([
                      [
                        'deep',
                        {
                          level7: {
                            level8: {
                              level9: {
                                level10: {
                                  level11: new Set([42, 'hello']),
                                },
                              },
                            },
                          },
                        },
                      ],
                    ]),
                  ],
                },
              ]),
            ],
          ]),
        ],
      },
    };

    const result = walker(input, new Map(), new SuperJSON(), false);

    // Verify the transformedValue has the correct structure:
    // Maps become arrays of [key, value] pairs, Sets become arrays
    const mapEntries = result.transformedValue.obj.arr[0];
    expect(mapEntries).toEqual([
      [
        'key',
        [
          {
            inner: [
              [
                [
                  'deep',
                  {
                    level7: {
                      level8: {
                        level9: {
                          level10: {
                            level11: [42, 'hello'],
                          },
                        },
                      },
                    },
                  },
                ],
              ],
            ],
          },
        ],
      ],
    ]);

    // Verify annotations exist for Map, Set types at correct paths
    expect(result.annotations).toBeDefined();
    // The outer Map
    expect(result.annotations!['obj.arr.0']).toEqual(
      expect.arrayContaining(['map'])
    );
    // The outer Set (inside the map value at 0.1)
    expect(result.annotations!['obj.arr.0.0\\.1']).toEqual(
      expect.arrayContaining(['set'])
    );
    // The inner Map
    expect(result.annotations!['obj.arr.0.0\\.1.0.inner.0']).toEqual(
      expect.arrayContaining(['map'])
    );
    // The innermost Set
    expect(
      result.annotations![
        'obj.arr.0.0\\.1.0.inner.0.0\\.1.level7.level8.level9.level10.level11'
      ]
    ).toEqual(expect.arrayContaining(['set']));
  });

  test('circular reference detection via objectsInThisPath', () => {
    // Create an object with a circular reference
    const obj: Record<string, unknown> = {
      a: {
        b: {
          c: {
            d: {
              e: {} as Record<string, unknown>,
            },
          },
        },
      },
    };
    // Create a circular reference: e.circular points back to obj
    (
      (obj.a as Record<string, unknown>).b as Record<string, unknown>
    ).c as Record<string, unknown>;
    const e = (
      (
        ((obj.a as Record<string, unknown>).b as Record<string, unknown>)
          .c as Record<string, unknown>
      ).d as Record<string, unknown>
    ).e as Record<string, unknown>;
    e.circular = obj;

    const result = walker(obj, new Map(), new SuperJSON(), false);

    // The circular reference should be replaced with null
    expect(
      result.transformedValue.a.b.c.d.e.circular
    ).toBeNull();

    // Non-circular parts should still be intact
    expect(result.transformedValue.a.b.c.d.e).toBeDefined();
    expect(result.transformedValue.a.b.c.d.e).toHaveProperty('circular');
  });

  test('deeply nested object with repeated (non-circular) references', () => {
    const shared = { x: 1, y: new Date('2025-06-15T00:00:00.000Z') };
    const input = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  level7: {
                    level8: {
                      level9: {
                        level10: {
                          first: shared,
                          second: shared,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const identities = new Map<unknown, unknown[][]>();
    const result = walker(input, identities, new SuperJSON(), false);

    // Both references should produce the same transformedValue
    const base = result.transformedValue.level1.level2.level3.level4.level5
      .level6.level7.level8.level9.level10;
    expect(base.first).toEqual({ x: 1, y: '2025-06-15T00:00:00.000Z' });
    expect(base.second).toEqual({ x: 1, y: '2025-06-15T00:00:00.000Z' });

    // The identities map should record that shared was seen at two paths
    const sharedPaths = identities.get(shared);
    expect(sharedPaths).toBeDefined();
    expect(sharedPaths!.length).toBe(2);
  });

  test('deeply nested with all plain values produces no annotations', () => {
    // Build 12 levels of plain objects with only JSON-safe primitives
    const input = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          k: {
                            l: 'deep-value',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = walker(input, new Map(), new SuperJSON(), false);

    expect(
      result.transformedValue.a.b.c.d.e.f.g.h.i.j.k.l
    ).toBe('deep-value');
    // No special types means no annotations
    expect(result.annotations).toBeUndefined();
  });
});
