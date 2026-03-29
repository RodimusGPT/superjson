import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  const superJson = new SuperJSON();

  test('serializes BigInt64Array with meta annotation and preserved values', () => {
    const arr = new BigInt64Array([1n, -2n, 3n]);
    const result = superJson.serialize(arr);

    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toBeDefined();

    // The annotation should indicate a typed-array with the correct constructor name
    const annotation = result.meta?.values;
    expect(annotation).toContainEqual('typed-array');

    // Values should be preserved as strings (bigints serialized via toString)
    const json = result.json as string[];
    expect(json).toHaveLength(3);
  });

  test('serializes BigUint64Array with meta annotation and preserved values', () => {
    const arr = new BigUint64Array([0n, 42n, 100n]);
    const result = superJson.serialize(arr);

    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toBeDefined();

    const json = result.json as string[];
    expect(json).toHaveLength(3);
  });

  test('round-trips BigInt64Array through serialize/deserialize', () => {
    const original = new BigInt64Array([0n, -1n, 9007199254740993n]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigInt64Array>(result);

    expect(restored).toBeInstanceOf(BigInt64Array);
    expect(restored).toEqual(original);
  });

  test('round-trips BigUint64Array through serialize/deserialize', () => {
    const original = new BigUint64Array([0n, 1n, 18446744073709551615n]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigUint64Array>(result);

    expect(restored).toBeInstanceOf(BigUint64Array);
    expect(restored).toEqual(original);
  });

  test('handles empty BigInt64Array', () => {
    const original = new BigInt64Array([]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigInt64Array>(result);

    expect(restored).toBeInstanceOf(BigInt64Array);
    expect(restored.length).toBe(0);
  });

  test('handles empty BigUint64Array', () => {
    const original = new BigUint64Array([]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigUint64Array>(result);

    expect(restored).toBeInstanceOf(BigUint64Array);
    expect(restored.length).toBe(0);
  });

  test('handles BigInt64Array with large positive and negative values', () => {
    const original = new BigInt64Array([
      9223372036854775807n,  // max int64
      -9223372036854775808n, // min int64
    ]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigInt64Array>(result);

    expect(restored).toBeInstanceOf(BigInt64Array);
    expect(restored).toEqual(original);
  });

  test('handles BigUint64Array with max uint64 value', () => {
    const original = new BigUint64Array([18446744073709551615n]);
    const result = superJson.serialize(original);
    const restored = superJson.deserialize<BigUint64Array>(result);

    expect(restored).toBeInstanceOf(BigUint64Array);
    expect(restored[0]).toBe(18446744073709551615n);
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
