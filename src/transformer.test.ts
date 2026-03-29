import SuperJSON from './index.js';

import { test, expect, describe, vi, afterEach } from 'vitest';

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

describe('BigInt deserialization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('throws an error when BigInt is not available', () => {
    vi.stubGlobal('BigInt', undefined);

    const payload = {
      json: '12345',
      meta: {
        values: ['bigint'],
      },
    };

    expect(() => SuperJSON.deserialize(payload)).toThrow();
  });

  test('throws an error with a descriptive message when BigInt is unavailable', () => {
    vi.stubGlobal('BigInt', undefined);

    const payload = {
      json: '999',
      meta: {
        values: ['bigint'],
      },
    };

    expect(() => SuperJSON.deserialize(payload)).toThrow(/BigInt/);
  });

  test('throws when BigInt is undefined and bigint value is zero', () => {
    vi.stubGlobal('BigInt', undefined);

    const payload = {
      json: '0',
      meta: {
        values: ['bigint'],
      },
    };

    expect(() => SuperJSON.deserialize(payload)).toThrow();
  });

  test('successfully deserializes bigint when BigInt is available', () => {
    const original = BigInt('12345');
    const serialized = SuperJSON.serialize(original);
    const deserialized = SuperJSON.deserialize<bigint>(serialized);

    expect(deserialized).toBe(original);
    expect(typeof deserialized).toBe('bigint');
  });

  test('successfully deserializes a large bigint value', () => {
    const original = BigInt('9007199254740993');
    const serialized = SuperJSON.serialize(original);
    const deserialized = SuperJSON.deserialize<bigint>(serialized);

    expect(deserialized).toBe(original);
  });

  test('successfully deserializes bigint zero', () => {
    const original = BigInt(0);
    const serialized = SuperJSON.serialize(original);
    const deserialized = SuperJSON.deserialize<bigint>(serialized);

    expect(deserialized).toBe(original);
    expect(typeof deserialized).toBe('bigint');
  });

  test('successfully deserializes negative bigint', () => {
    const original = BigInt('-42');
    const serialized = SuperJSON.serialize(original);
    const deserialized = SuperJSON.deserialize<bigint>(serialized);

    expect(deserialized).toBe(original);
  });
});
