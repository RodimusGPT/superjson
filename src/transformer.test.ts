import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  test('round-trip serialization of BigInt64Array', () => {
    const input = new BigInt64Array([0n, 1n, -1n, 9007199254740993n]);
    const result = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(result).toBeInstanceOf(BigInt64Array);
    expect(result).toEqual(input);
  });

  test('round-trip serialization of BigUint64Array', () => {
    const input = new BigUint64Array([0n, 1n, 42n, 18446744073709551615n]);
    const result = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(result).toBeInstanceOf(BigUint64Array);
    expect(result).toEqual(input);
  });

  test('BigInt typed arrays nested inside objects', () => {
    const input = {
      signed: new BigInt64Array([10n, -20n]),
      unsigned: new BigUint64Array([30n, 40n]),
      label: 'test',
    };
    const result = SuperJSON.deserialize<typeof input>(
      SuperJSON.serialize(input)
    );
    expect(result.signed).toBeInstanceOf(BigInt64Array);
    expect(result.signed).toEqual(new BigInt64Array([10n, -20n]));
    expect(result.unsigned).toBeInstanceOf(BigUint64Array);
    expect(result.unsigned).toEqual(new BigUint64Array([30n, 40n]));
    expect(result.label).toBe('test');
  });

  test('serialization metadata includes typed-array tag with correct constructor name', () => {
    const serialized64 = SuperJSON.serialize(new BigInt64Array([1n]));
    expect(serialized64.meta?.values).toEqual([['typed-array', 'BigInt64Array']]);

    const serializedU64 = SuperJSON.serialize(new BigUint64Array([1n]));
    expect(serializedU64.meta?.values).toEqual([
      ['typed-array', 'BigUint64Array'],
    ]);
  });

  test('empty BigInt typed arrays round-trip correctly', () => {
    const empty64 = new BigInt64Array([]);
    const result64 = SuperJSON.deserialize(SuperJSON.serialize(empty64));
    expect(result64).toBeInstanceOf(BigInt64Array);
    expect(result64).toEqual(empty64);

    const emptyU64 = new BigUint64Array([]);
    const resultU64 = SuperJSON.deserialize(SuperJSON.serialize(emptyU64));
    expect(resultU64).toBeInstanceOf(BigUint64Array);
    expect(resultU64).toEqual(emptyU64);
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
