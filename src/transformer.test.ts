import SuperJSON from './index.js';

import { test, expect } from 'vitest';

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

test('BigInt64Array round-trips through serialize/deserialize', () => {
  const input = new BigInt64Array([1n, -2n, 3n]);
  const serialized = SuperJSON.serialize(input);
  const deserialized = SuperJSON.deserialize(serialized);

  expect(deserialized).toBeInstanceOf(BigInt64Array);
  const result = deserialized as BigInt64Array;
  expect(result.length).toBe(3);
  expect(result[0]).toBe(1n);
  expect(result[1]).toBe(-2n);
  expect(result[2]).toBe(3n);
});

test('BigUint64Array round-trips through serialize/deserialize', () => {
  const input = new BigUint64Array([0n, 42n, 100n]);
  const serialized = SuperJSON.serialize(input);
  const deserialized = SuperJSON.deserialize(serialized);

  expect(deserialized).toBeInstanceOf(BigUint64Array);
  const result = deserialized as BigUint64Array;
  expect(result.length).toBe(3);
  expect(result[0]).toBe(0n);
  expect(result[1]).toBe(42n);
  expect(result[2]).toBe(100n);
});

test('deserialized BigInt typed arrays contain actual bigint elements', () => {
  const int64Input = new BigInt64Array([7n]);
  const int64Result = SuperJSON.deserialize(
    SuperJSON.serialize(int64Input)
  ) as BigInt64Array;
  expect(typeof int64Result[0]).toBe('bigint');

  const uint64Input = new BigUint64Array([7n]);
  const uint64Result = SuperJSON.deserialize(
    SuperJSON.serialize(uint64Input)
  ) as BigUint64Array;
  expect(typeof uint64Result[0]).toBe('bigint');
});

test('empty BigInt64Array round-trips correctly', () => {
  const input = new BigInt64Array([]);
  const serialized = SuperJSON.serialize(input);
  const deserialized = SuperJSON.deserialize(serialized);

  expect(deserialized).toBeInstanceOf(BigInt64Array);
  expect((deserialized as BigInt64Array).length).toBe(0);
});

test('empty BigUint64Array round-trips correctly', () => {
  const input = new BigUint64Array([]);
  const serialized = SuperJSON.serialize(input);
  const deserialized = SuperJSON.deserialize(serialized);

  expect(deserialized).toBeInstanceOf(BigUint64Array);
  expect((deserialized as BigUint64Array).length).toBe(0);
});
