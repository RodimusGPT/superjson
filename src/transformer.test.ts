import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array round-trip', () => {
  test('BigInt64Array round-trip with typical values', () => {
    const instance = new SuperJSON();
    const input = BigInt64Array.of(0n, 1n, -1n, 9007199254740993n, -9007199254740993n);
    const serialized = instance.serialize(input);
    const deserialized = instance.deserialize<BigInt64Array>(serialized);

    expect(deserialized).toBeInstanceOf(BigInt64Array);
    expect(deserialized.length).toBe(input.length);
    for (let i = 0; i < input.length; i++) {
      expect(deserialized[i]).toBe(input[i]);
    }
  });

  test('BigUint64Array round-trip with typical values', () => {
    const instance = new SuperJSON();
    const input = BigUint64Array.of(0n, 1n, 42n, 18446744073709551615n);
    const serialized = instance.serialize(input);
    const deserialized = instance.deserialize<BigUint64Array>(serialized);

    expect(deserialized).toBeInstanceOf(BigUint64Array);
    expect(deserialized.length).toBe(input.length);
    for (let i = 0; i < input.length; i++) {
      expect(deserialized[i]).toBe(input[i]);
    }
  });

  test('serialized form preserves bigint element values', () => {
    const instance = new SuperJSON();
    const value = 9007199254740993n; // larger than Number.MAX_SAFE_INTEGER
    const input = BigInt64Array.of(value);
    const serialized = instance.serialize(input);
    const deserialized = instance.deserialize<BigInt64Array>(serialized);

    expect(deserialized[0]).toBe(value);
  });

  test('empty BigInt64Array round-trip', () => {
    const instance = new SuperJSON();
    const input = new BigInt64Array(0);
    const serialized = instance.serialize(input);
    const deserialized = instance.deserialize<BigInt64Array>(serialized);

    expect(deserialized).toBeInstanceOf(BigInt64Array);
    expect(deserialized.length).toBe(0);
  });

  test('BigInt64Array nested in an object round-trip', () => {
    const instance = new SuperJSON();
    const input = { data: BigInt64Array.of(1n, 2n, 3n) };
    const serialized = instance.serialize(input);
    const deserialized = instance.deserialize<{ data: BigInt64Array }>(serialized);

    expect(deserialized.data).toBeInstanceOf(BigInt64Array);
    expect(deserialized.data.length).toBe(3);
    expect(deserialized.data[0]).toBe(1n);
    expect(deserialized.data[1]).toBe(2n);
    expect(deserialized.data[2]).toBe(3n);
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
