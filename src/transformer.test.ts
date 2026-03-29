import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  test('serializes BigInt64Array with type annotation', () => {
    const instance = new SuperJSON();
    const input = { a: new BigInt64Array([1n, -2n, 3n]) };
    const result = instance.serialize(input);

    expect(result.meta?.values).toBeDefined();
    expect(result.meta?.values).toEqual({
      a: [['typed-array', 'BigInt64Array']],
    });
  });

  test('round-trips BigInt64Array through serialize/deserialize', () => {
    const instance = new SuperJSON();
    const original = new BigInt64Array([0n, -1n, 9007199254740993n]);
    const result = instance.deserialize<{ a: BigInt64Array }>(
      instance.serialize({ a: original })
    );

    expect(result.a).toBeInstanceOf(BigInt64Array);
    expect(result.a).toEqual(original);
  });

  test('serializes BigUint64Array with type annotation', () => {
    const instance = new SuperJSON();
    const input = { b: new BigUint64Array([0n, 42n, 18446744073709551615n]) };
    const result = instance.serialize(input);

    expect(result.meta?.values).toBeDefined();
    expect(result.meta?.values).toEqual({
      b: [['typed-array', 'BigUint64Array']],
    });
  });

  test('round-trips BigUint64Array through serialize/deserialize', () => {
    const instance = new SuperJSON();
    const original = new BigUint64Array([0n, 42n, 18446744073709551615n]);
    const result = instance.deserialize<{ b: BigUint64Array }>(
      instance.serialize({ b: original })
    );

    expect(result.b).toBeInstanceOf(BigUint64Array);
    expect(result.b).toEqual(original);
  });

  test('round-trips empty BigInt typed arrays', () => {
    const instance = new SuperJSON();
    const input = {
      a: new BigInt64Array([]),
      b: new BigUint64Array([]),
    };
    const result = instance.deserialize<typeof input>(
      instance.serialize(input)
    );

    expect(result.a).toBeInstanceOf(BigInt64Array);
    expect(result.a.length).toBe(0);
    expect(result.b).toBeInstanceOf(BigUint64Array);
    expect(result.b.length).toBe(0);
  });

  test('round-trips nested objects containing BigInt typed arrays', () => {
    const instance = new SuperJSON();
    const input = {
      level1: {
        level2: {
          signed: new BigInt64Array([10n, -20n]),
          unsigned: new BigUint64Array([30n, 40n]),
        },
        list: [new BigInt64Array([100n])],
      },
    };
    const result = instance.deserialize<typeof input>(
      instance.serialize(input)
    );

    expect(result.level1.level2.signed).toBeInstanceOf(BigInt64Array);
    expect(result.level1.level2.signed).toEqual(
      new BigInt64Array([10n, -20n])
    );
    expect(result.level1.level2.unsigned).toBeInstanceOf(BigUint64Array);
    expect(result.level1.level2.unsigned).toEqual(
      new BigUint64Array([30n, 40n])
    );
    expect(result.level1.list[0]).toBeInstanceOf(BigInt64Array);
    expect(result.level1.list[0]).toEqual(new BigInt64Array([100n]));
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
