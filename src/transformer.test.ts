import SuperJSON from './index.js';
import { untransformValue } from './transformer.js';

import { test, expect, describe, afterEach } from 'vitest';

describe('BigInt untransform', () => {
  const originalBigInt = globalThis.BigInt;

  afterEach(() => {
    globalThis.BigInt = originalBigInt;
  });

  test('throws a descriptive error when BigInt is not available', () => {
    Object.defineProperty(globalThis, 'BigInt', { value: undefined, configurable: true, writable: true });

    const superJson = new SuperJSON();

    expect(() => {
      untransformValue('123', 'bigint', superJson);
    }).toThrowError(/BigInt/);
  });

  test('throws when BigInt is not available for deserialization via SuperJSON.deserialize', () => {
    const superJson = new SuperJSON();

    // Serialize while BigInt is available
    const serialized = superJson.serialize(BigInt(42));

    // Now remove BigInt
    Object.defineProperty(globalThis, 'BigInt', { value: undefined, configurable: true, writable: true });

    expect(() => {
      superJson.deserialize(serialized);
    }).toThrowError(/BigInt/);
  });

  test('correctly roundtrips bigint values when BigInt is available', () => {
    const superJson = new SuperJSON();
    const value = BigInt('9007199254740993');
    const serialized = superJson.serialize(value);
    const deserialized = superJson.deserialize<bigint>(serialized);
    expect(deserialized).toBe(value);
  });

  test('correctly roundtrips bigint inside objects when BigInt is available', () => {
    const superJson = new SuperJSON();
    const obj = { count: BigInt(0), large: BigInt('-999999999999999999') };
    const serialized = superJson.serialize(obj);
    const deserialized = superJson.deserialize<typeof obj>(serialized);
    expect(deserialized.count).toBe(BigInt(0));
    expect(deserialized.large).toBe(BigInt('-999999999999999999'));
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
