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
  const value = new BigInt64Array([0n, 1n, -1n, 9007199254740991n]);
  const serialized = instance.serialize(value);
  const deserialized = instance.deserialize<BigInt64Array>(serialized);
  expect(deserialized).toEqual(value);
  expect(deserialized).toBeInstanceOf(BigInt64Array);
});

test('BigUint64Array round-trips through serialize/deserialize', () => {
  const instance = new SuperJSON();
  const value = new BigUint64Array([0n, 1n, 18446744073709551615n]);
  const serialized = instance.serialize(value);
  const deserialized = instance.deserialize<BigUint64Array>(serialized);
  expect(deserialized).toEqual(value);
  expect(deserialized).toBeInstanceOf(BigUint64Array);
});

test('nested objects containing BigInt typed arrays round-trip', () => {
  const instance = new SuperJSON();
  const value = {
    signed: new BigInt64Array([0n, -1n]),
    unsigned: new BigUint64Array([0n, 1n]),
    label: 'test',
  };
  const serialized = instance.serialize(value);
  const deserialized = instance.deserialize<typeof value>(serialized);
  expect(deserialized).toEqual(value);
  expect(deserialized.signed).toBeInstanceOf(BigInt64Array);
  expect(deserialized.unsigned).toBeInstanceOf(BigUint64Array);
});

test('empty BigInt typed arrays round-trip', () => {
  const instance = new SuperJSON();
  const signed = new BigInt64Array([]);
  const unsigned = new BigUint64Array([]);

  const serializedSigned = instance.serialize(signed);
  const deserializedSigned = instance.deserialize<BigInt64Array>(serializedSigned);
  expect(deserializedSigned).toEqual(signed);
  expect(deserializedSigned).toBeInstanceOf(BigInt64Array);

  const serializedUnsigned = instance.serialize(unsigned);
  const deserializedUnsigned = instance.deserialize<BigUint64Array>(serializedUnsigned);
  expect(deserializedUnsigned).toEqual(unsigned);
  expect(deserializedUnsigned).toBeInstanceOf(BigUint64Array);
});
