import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt64Array serialization', () => {
  test('round-trip with sample values', () => {
    const instance = new SuperJSON();
    const input = BigInt64Array.from([0n, -1n, 9007199254740993n]);
    const output = instance.deserialize<BigInt64Array>(instance.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('empty array round-trip', () => {
    const instance = new SuperJSON();
    const input = new BigInt64Array([]);
    const output = instance.deserialize<BigInt64Array>(instance.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output.length).toBe(0);
  });

  test('serialized meta identifies type as BigInt64Array', () => {
    const instance = new SuperJSON();
    const input = BigInt64Array.from([1n, 2n]);
    const result = instance.serialize(input);
    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toEqual(
      expect.arrayContaining([
        expect.stringContaining('BigInt64Array'),
      ])
    );
  });
});

describe('BigUint64Array serialization', () => {
  test('round-trip with sample values', () => {
    const instance = new SuperJSON();
    const input = BigUint64Array.from([0n, 1n, 18446744073709551615n]);
    const output = instance.deserialize<BigUint64Array>(instance.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });

  test('empty array round-trip', () => {
    const instance = new SuperJSON();
    const input = new BigUint64Array([]);
    const output = instance.deserialize<BigUint64Array>(instance.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output.length).toBe(0);
  });

  test('serialized meta identifies type as BigUint64Array', () => {
    const instance = new SuperJSON();
    const input = BigUint64Array.from([1n, 2n]);
    const result = instance.serialize(input);
    expect(result.meta).toBeDefined();
    expect(result.meta?.values).toEqual(
      expect.arrayContaining([
        expect.stringContaining('BigUint64Array'),
      ])
    );
  });
});

describe('nested objects with BigInt typed arrays', () => {
  test('object containing BigInt64Array and BigUint64Array', () => {
    const instance = new SuperJSON();
    const input = {
      signed: BigInt64Array.from([0n, -1n]),
      unsigned: BigUint64Array.from([0n, 1n]),
      label: 'test',
    };
    const output = instance.deserialize<typeof input>(instance.serialize(input));
    expect(output.signed).toBeInstanceOf(BigInt64Array);
    expect(output.signed).toEqual(input.signed);
    expect(output.unsigned).toBeInstanceOf(BigUint64Array);
    expect(output.unsigned).toEqual(input.unsigned);
    expect(output.label).toBe('test');
  });

  test('deeply nested BigInt typed array', () => {
    const instance = new SuperJSON();
    const input = { a: { b: { c: BigInt64Array.from([42n]) } } };
    const output = instance.deserialize<typeof input>(instance.serialize(input));
    expect(output.a.b.c).toBeInstanceOf(BigInt64Array);
    expect(output.a.b.c).toEqual(BigInt64Array.from([42n]));
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
