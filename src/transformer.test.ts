import SuperJSON from './index.js';

import { test, expect } from 'vitest';

test('BigInt64Array round-trips through serialize/deserialize', () => {
  const input = { arr: BigInt64Array.of(1n, -2n, 3n) };
  const output = SuperJSON.deserialize(SuperJSON.serialize(input));
  expect(output.arr).toBeInstanceOf(BigInt64Array);
  expect(output.arr).toEqual(BigInt64Array.of(1n, -2n, 3n));
});

test('BigUint64Array round-trips through serialize/deserialize', () => {
  const input = { arr: BigUint64Array.of(1n, 2n, 3n) };
  const output = SuperJSON.deserialize(SuperJSON.serialize(input));
  expect(output.arr).toBeInstanceOf(BigUint64Array);
  expect(output.arr).toEqual(BigUint64Array.of(1n, 2n, 3n));
});

test('empty BigInt64Array round-trips through serialize/deserialize', () => {
  const input = { arr: new BigInt64Array() };
  const output = SuperJSON.deserialize(SuperJSON.serialize(input));
  expect(output.arr).toBeInstanceOf(BigInt64Array);
  expect(output.arr.length).toBe(0);
});

test('empty BigUint64Array round-trips through serialize/deserialize', () => {
  const input = { arr: new BigUint64Array() };
  const output = SuperJSON.deserialize(SuperJSON.serialize(input));
  expect(output.arr).toBeInstanceOf(BigUint64Array);
  expect(output.arr.length).toBe(0);
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
