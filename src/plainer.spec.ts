import SuperJSON from './index.js';
import { walker } from './plainer.js';

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

test('walker handles bigint inside an object', () => {
  const identities = new Map();
  const result = walker(
    { value: BigInt(42) },
    identities,
    new SuperJSON(),
    false
  );

  expect(result.transformedValue).toEqual({ value: '42' });
  expect(result.annotations).toEqual({
    value: ['bigint'],
  });
});

test('walker handles bigint as a top-level primitive', () => {
  const identities = new Map();
  const result = walker(BigInt(0), identities, new SuperJSON(), false);

  expect(result.transformedValue).toBe('0');
  expect(result.annotations).toEqual(['bigint']);
});

test('walker treats bigint as a primitive and does not track identity', () => {
  const identities = new Map();
  const bigintValue = BigInt(99);
  walker(
    { a: bigintValue, b: bigintValue },
    identities,
    new SuperJSON(),
    false
  );

  // bigint should be treated as a primitive and not added to identities
  expect(identities.has(bigintValue)).toBe(false);
});

test('walker handles large bigint values', () => {
  const identities = new Map();
  const result = walker(
    { big: BigInt('9007199254740993') },
    identities,
    new SuperJSON(),
    false
  );

  expect(result.transformedValue).toEqual({ big: '9007199254740993' });
  expect(result.annotations).toEqual({
    big: ['bigint'],
  });
});

test('walker handles negative bigint', () => {
  const identities = new Map();
  const result = walker(
    { neg: BigInt(-123) },
    identities,
    new SuperJSON(),
    false
  );

  expect(result.transformedValue).toEqual({ neg: '-123' });
  expect(result.annotations).toEqual({
    neg: ['bigint'],
  });
});

test('walker handles bigint alongside other transformed types', () => {
  const identities = new Map();
  const result = walker(
    {
      count: BigInt(7),
      pattern: /abc/i,
      created: new Date('2024-01-01T00:00:00.000Z'),
    },
    identities,
    new SuperJSON(),
    false
  );

  expect(result.transformedValue).toEqual({
    count: '7',
    pattern: '/abc/i',
    created: '2024-01-01T00:00:00.000Z',
  });
  expect(result.annotations).toEqual({
    count: ['bigint'],
    pattern: ['regexp'],
    created: ['Date'],
  });
});
