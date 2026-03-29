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
  const instance = new SuperJSON();
  const input = new BigInt64Array([1n, -2n, 0n, 9007199254740993n]);
  const result = instance.serialize(input);

  expect(result.meta).toBeDefined();
  expect(result.meta?.values).toBeDefined();

  const output = instance.deserialize<BigInt64Array>(result);
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output.length).toBe(4);
  expect(output[0]).toBe(1n);
  expect(output[1]).toBe(-2n);
  expect(output[2]).toBe(0n);
  expect(output[3]).toBe(9007199254740993n);
});

test('BigUint64Array round-trips through serialize/deserialize', () => {
  const instance = new SuperJSON();
  const input = new BigUint64Array([0n, 42n, 18446744073709551615n]);
  const result = instance.serialize(input);

  expect(result.meta).toBeDefined();
  expect(result.meta?.values).toBeDefined();

  const output = instance.deserialize<BigUint64Array>(result);
  expect(output).toBeInstanceOf(BigUint64Array);
  expect(output.length).toBe(3);
  expect(output[0]).toBe(0n);
  expect(output[1]).toBe(42n);
  expect(output[2]).toBe(18446744073709551615n);
});

test('BigInt64Array serialization produces typed-array annotation', () => {
  const instance = new SuperJSON();
  const input = new BigInt64Array([100n]);
  const result = instance.serialize(input);

  expect(result.meta?.values).toContainEqual(
    expect.arrayContaining(['typed-array', 'BigInt64Array'])
  );
});

test('BigUint64Array serialization produces typed-array annotation', () => {
  const instance = new SuperJSON();
  const input = new BigUint64Array([100n]);
  const result = instance.serialize(input);

  expect(result.meta?.values).toContainEqual(
    expect.arrayContaining(['typed-array', 'BigUint64Array'])
  );
});

test('nested objects containing BigInt typed arrays round-trip correctly', () => {
  const instance = new SuperJSON();
  const input = {
    name: 'test',
    signed: new BigInt64Array([1n, -1n]),
    unsigned: new BigUint64Array([42n]),
    nested: {
      data: new BigInt64Array([999n]),
    },
  };

  const result = instance.serialize(input);
  const output = instance.deserialize<typeof input>(result);

  expect(output.name).toBe('test');
  expect(output.signed).toBeInstanceOf(BigInt64Array);
  expect(output.signed[0]).toBe(1n);
  expect(output.signed[1]).toBe(-1n);
  expect(output.unsigned).toBeInstanceOf(BigUint64Array);
  expect(output.unsigned[0]).toBe(42n);
  expect(output.nested.data).toBeInstanceOf(BigInt64Array);
  expect(output.nested.data[0]).toBe(999n);
});

test('empty BigInt64Array round-trips correctly', () => {
  const instance = new SuperJSON();
  const input = new BigInt64Array([]);
  const result = instance.serialize(input);
  const output = instance.deserialize<BigInt64Array>(result);

  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output.length).toBe(0);
});
