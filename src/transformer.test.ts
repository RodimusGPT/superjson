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
  const input = BigInt64Array.of(1n, 2n, 3n);
  const { json, meta } = SuperJSON.serialize(input);
  const output = SuperJSON.deserialize<BigInt64Array>({ json, meta });
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output).toEqual(BigInt64Array.of(1n, 2n, 3n));
});

test('BigUint64Array round-trips through serialize/deserialize', () => {
  const input = BigUint64Array.of(1n, 2n, 3n);
  const { json, meta } = SuperJSON.serialize(input);
  const output = SuperJSON.deserialize<BigUint64Array>({ json, meta });
  expect(output).toBeInstanceOf(BigUint64Array);
  expect(output).toEqual(BigUint64Array.of(1n, 2n, 3n));
});

test('Empty BigInt64Array round-trips through serialize/deserialize', () => {
  const input = new BigInt64Array();
  const { json, meta } = SuperJSON.serialize(input);
  const output = SuperJSON.deserialize<BigInt64Array>({ json, meta });
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output.length).toBe(0);
});

test('BigInt64Array nested in object round-trips through serialize/deserialize', () => {
  const input = { data: BigInt64Array.of(10n, 20n) };
  const { json, meta } = SuperJSON.serialize(input);
  const output = SuperJSON.deserialize<{ data: BigInt64Array }>({ json, meta });
  expect(output.data).toBeInstanceOf(BigInt64Array);
  expect(output.data).toEqual(BigInt64Array.of(10n, 20n));
});
