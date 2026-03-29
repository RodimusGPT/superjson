import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt64Array serialization', () => {
  test('round-trips BigInt64Array', () => {
    const input = new BigInt64Array([1n, -2n, 3n]);
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual([['typed-array', 'BigInt64Array']]);

    const output = SuperJSON.deserialize<BigInt64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('round-trips empty BigInt64Array', () => {
    const input = new BigInt64Array([]);
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual([['typed-array', 'BigInt64Array']]);

    const output = SuperJSON.deserialize<BigInt64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output.length).toBe(0);
  });
});

describe('BigUint64Array serialization', () => {
  test('round-trips BigUint64Array', () => {
    const input = new BigUint64Array([0n, 100n, 9007199254740993n]);
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual([['typed-array', 'BigUint64Array']]);

    const output = SuperJSON.deserialize<BigUint64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });

  test('round-trips empty BigUint64Array', () => {
    const input = new BigUint64Array([]);
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual([['typed-array', 'BigUint64Array']]);

    const output = SuperJSON.deserialize<BigUint64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output.length).toBe(0);
  });
});

describe('BigInt typed arrays in nested objects', () => {
  test('round-trips nested BigInt64Array and BigUint64Array', () => {
    const input = {
      signed: new BigInt64Array([-1n, 0n, 1n]),
      unsigned: new BigUint64Array([42n, 99n]),
    };
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual({
      signed: [['typed-array', 'BigInt64Array']],
      unsigned: [['typed-array', 'BigUint64Array']],
    });

    const output = SuperJSON.deserialize<typeof input>({ json, meta });
    expect(output.signed).toBeInstanceOf(BigInt64Array);
    expect(output.unsigned).toBeInstanceOf(BigUint64Array);
    expect(output.signed).toEqual(input.signed);
    expect(output.unsigned).toEqual(input.unsigned);
  });

  test('round-trips deeply nested BigInt typed arrays', () => {
    const input = {
      data: {
        ids: new BigUint64Array([1n, 2n, 3n]),
      },
    };
    const { json, meta } = SuperJSON.serialize(input);

    const output = SuperJSON.deserialize<typeof input>({ json, meta });
    expect(output.data.ids).toBeInstanceOf(BigUint64Array);
    expect(output.data.ids).toEqual(input.data.ids);
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
