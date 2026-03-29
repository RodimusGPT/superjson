import SuperJSON from './index.js';
import {
  walker,
  generateReferentialEqualityAnnotations,
} from './plainer.js';

import { test, expect } from 'vitest';

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

test('bigint values should not trigger identity tracking', () => {
  const identities = new Map<unknown, unknown[][]>();
  const superJson = new SuperJSON();

  const input = {
    x: 1n,
    y: 1n,
    z: 999999999999999999n,
  };

  walker(input, identities, superJson, false);

  // bigints are primitives and should not be added to identity tracking.
  // Only the root object itself should appear in identities, not the bigint values.
  const trackedValues = [...identities.keys()];
  const bigintTracked = trackedValues.filter(v => typeof v === 'bigint');
  expect(bigintTracked).toEqual([]);
});

test('duplicate bigint values should not produce referential equality annotations', () => {
  const identities = new Map<unknown, unknown[][]>();
  const superJson = new SuperJSON();

  const sameBigint = 42n;
  const input = {
    a: sameBigint,
    b: sameBigint,
    c: sameBigint,
  };

  walker(input, identities, superJson, false);

  const refAnnotations = generateReferentialEqualityAnnotations(
    identities,
    false
  );

  // bigints are value types — identical bigint values in different properties
  // should NOT generate referential equality annotations
  expect(refAnnotations).toBeUndefined();
});
