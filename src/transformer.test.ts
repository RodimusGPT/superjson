import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  test('serializes and deserializes BigInt64Array', () => {
    const input = new BigInt64Array([0n, -1n, 9007199254740993n]);
    const result = SuperJSON.serialize(input);

    expect(result.meta?.values).toEqual([['typed-array', 'BigInt64Array']]);

    const deserialized = SuperJSON.deserialize<BigInt64Array>(result);
    expect(deserialized).toBeInstanceOf(BigInt64Array);
    expect(deserialized.length).toBe(3);
    expect(deserialized[0]).toBe(0n);
    expect(deserialized[1]).toBe(-1n);
    expect(deserialized[2]).toBe(9007199254740993n);
  });

  test('serializes and deserializes BigUint64Array', () => {
    const input = new BigUint64Array([0n, 18446744073709551615n]);
    const result = SuperJSON.serialize(input);

    expect(result.meta?.values).toEqual([['typed-array', 'BigUint64Array']]);

    const deserialized = SuperJSON.deserialize<BigUint64Array>(result);
    expect(deserialized).toBeInstanceOf(BigUint64Array);
    expect(deserialized.length).toBe(2);
    expect(deserialized[0]).toBe(0n);
    expect(deserialized[1]).toBe(18446744073709551615n);
  });

  test('round-trips BigInt64Array nested in an object', () => {
    const input = {
      a: new BigInt64Array([0n, -1n]),
      b: new BigUint64Array([42n]),
    };
    const result = SuperJSON.serialize(input);

    expect(result.meta?.values).toEqual({
      a: [['typed-array', 'BigInt64Array']],
      b: [['typed-array', 'BigUint64Array']],
    });

    const deserialized = SuperJSON.deserialize<typeof input>(result);
    expect(deserialized.a).toBeInstanceOf(BigInt64Array);
    expect(deserialized.b).toBeInstanceOf(BigUint64Array);
    expect(deserialized.a[0]).toBe(0n);
    expect(deserialized.a[1]).toBe(-1n);
    expect(deserialized.b[0]).toBe(42n);
  });

  test('round-trips BigInt typed arrays nested in an array', () => {
    const input = [new BigInt64Array([100n]), new BigUint64Array([200n])];
    const result = SuperJSON.serialize(input);

    const deserialized = SuperJSON.deserialize<typeof input>(result);
    expect(deserialized[0]).toBeInstanceOf(BigInt64Array);
    expect(deserialized[1]).toBeInstanceOf(BigUint64Array);
    expect(deserialized[0][0]).toBe(100n);
    expect(deserialized[1][0]).toBe(200n);
  });

  test('handles empty BigInt64Array', () => {
    const input = new BigInt64Array([]);
    const result = SuperJSON.serialize(input);

    const deserialized = SuperJSON.deserialize<BigInt64Array>(result);
    expect(deserialized).toBeInstanceOf(BigInt64Array);
    expect(deserialized.length).toBe(0);
  });

  test('handles empty BigUint64Array', () => {
    const input = new BigUint64Array([]);
    const result = SuperJSON.serialize(input);

    const deserialized = SuperJSON.deserialize<BigUint64Array>(result);
    expect(deserialized).toBeInstanceOf(BigUint64Array);
    expect(deserialized.length).toBe(0);
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
