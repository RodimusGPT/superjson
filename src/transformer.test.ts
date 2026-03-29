import SuperJSON from './index.js';

import { test, expect, describe, vi, afterEach } from 'vitest';

describe('BigInt deserialization when BigInt is unavailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('deserializing a serialized bigint throws when BigInt is unavailable', () => {
    const serialized = SuperJSON.serialize(BigInt(42));

    vi.stubGlobal('BigInt', undefined);

    expect(() => SuperJSON.deserialize(serialized)).toThrow();
  });

  test('the error message mentions BigInt and suggests a polyfill', () => {
    const serialized = SuperJSON.serialize(BigInt(999));

    vi.stubGlobal('BigInt', undefined);

    expect(() => SuperJSON.deserialize(serialized)).toThrow(/BigInt/);
    expect(() => SuperJSON.deserialize(serialized)).toThrow(/polyfill/i);
  });

  test('deserializing a bigint within an object throws when BigInt is unavailable', () => {
    const serialized = SuperJSON.serialize({ value: BigInt(123) });

    vi.stubGlobal('BigInt', undefined);

    expect(() => SuperJSON.deserialize(serialized)).toThrow();
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
