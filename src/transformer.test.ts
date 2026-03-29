import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  const instance = new SuperJSON();

  test('BigInt64Array serializes with correct meta annotation', () => {
    const arr = new BigInt64Array([1n, -2n, 3n]);
    const result = instance.serialize(arr);
    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toContainEqual([
      'typed-array',
      'BigInt64Array',
    ]);
  });

  test('BigInt64Array round-trip preserves values', () => {
    const original = new BigInt64Array([0n, -9223372036854775808n, 9223372036854775807n]);
    const result = instance.serialize(original);
    const restored = instance.deserialize<BigInt64Array>(result);
    expect(restored).toBeInstanceOf(BigInt64Array);
    expect(restored).toEqual(original);
  });

  test('BigUint64Array serializes with correct meta annotation', () => {
    const arr = new BigUint64Array([0n, 18446744073709551615n]);
    const result = instance.serialize(arr);
    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toContainEqual([
      'typed-array',
      'BigUint64Array',
    ]);
  });

  test('BigUint64Array round-trip preserves values', () => {
    const original = new BigUint64Array([0n, 1n, 18446744073709551615n]);
    const result = instance.serialize(original);
    const restored = instance.deserialize<BigUint64Array>(result);
    expect(restored).toBeInstanceOf(BigUint64Array);
    expect(restored).toEqual(original);
  });

  test('empty BigInt64Array round-trip', () => {
    const original = new BigInt64Array([]);
    const result = instance.serialize(original);
    const restored = instance.deserialize<BigInt64Array>(result);
    expect(restored).toBeInstanceOf(BigInt64Array);
    expect(restored.length).toBe(0);
  });

  test('empty BigUint64Array round-trip', () => {
    const original = new BigUint64Array([]);
    const result = instance.serialize(original);
    const restored = instance.deserialize<BigUint64Array>(result);
    expect(restored).toBeInstanceOf(BigUint64Array);
    expect(restored.length).toBe(0);
  });

  test('nested object containing BigInt typed arrays', () => {
    const original = {
      signed: new BigInt64Array([1n, -2n]),
      unsigned: new BigUint64Array([3n, 4n]),
      label: 'test',
    };
    const result = instance.serialize(original);
    const restored = instance.deserialize<typeof original>(result);
    expect(restored.signed).toBeInstanceOf(BigInt64Array);
    expect(restored.signed).toEqual(original.signed);
    expect(restored.unsigned).toBeInstanceOf(BigUint64Array);
    expect(restored.unsigned).toEqual(original.unsigned);
    expect(restored.label).toBe('test');
  });
});

test('throws an descriptive error when transforming', () => {
  const instance = new SuperJSON();
  class FunnyNumber {
    constructor(private number: number) {}

    // @ts-ignore
    get theNumber() {
      return this.number;
    }
  }
  instance.registerClass(FunnyNumber);
  expect(() =>
    instance.deserialize({
      json: instance.serialize({
        number: new FunnyNumber(2137),
      }).json,
      meta: {
        values: [['class', 'NotRegistered']],
      },
    })
  ).toThrowError(
    `Trying to deserialize unknown class 'NotRegistered' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`
  );
});
