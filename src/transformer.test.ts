import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

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

describe('BigInt typed arrays', () => {
  const instance = new SuperJSON();

  test('round-trips BigInt64Array through serialize/deserialize', () => {
    const input = new BigInt64Array([1n, -2n, 3n]);
    const { json, meta } = instance.serialize(input);

    const output = instance.deserialize<BigInt64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output.length).toBe(3);
    expect(output[0]).toBe(1n);
    expect(output[1]).toBe(-2n);
    expect(output[2]).toBe(3n);
  });

  test('round-trips BigUint64Array through serialize/deserialize', () => {
    const input = new BigUint64Array([1n, 2n, 3n]);
    const { json, meta } = instance.serialize(input);

    const output = instance.deserialize<BigUint64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output.length).toBe(3);
    expect(output[0]).toBe(1n);
    expect(output[1]).toBe(2n);
    expect(output[2]).toBe(3n);
  });

  test('serialized meta contains typed-array annotation for BigInt64Array', () => {
    const input = { arr: new BigInt64Array([1n, -2n, 3n]) };
    const { meta } = instance.serialize(input);

    expect(meta).toBeDefined();
    expect(meta!.values).toEqual({
      arr: [['typed-array', 'BigInt64Array']],
    });
  });

  test('serialized meta contains typed-array annotation for BigUint64Array', () => {
    const input = { arr: new BigUint64Array([1n, 2n, 3n]) };
    const { meta } = instance.serialize(input);

    expect(meta).toBeDefined();
    expect(meta!.values).toEqual({
      arr: [['typed-array', 'BigUint64Array']],
    });
  });

  test('round-trips empty BigInt64Array', () => {
    const input = new BigInt64Array([]);
    const { json, meta } = instance.serialize(input);

    const output = instance.deserialize<BigInt64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output.length).toBe(0);
  });

  test('round-trips empty BigUint64Array', () => {
    const input = new BigUint64Array([]);
    const { json, meta } = instance.serialize(input);

    const output = instance.deserialize<BigUint64Array>({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output.length).toBe(0);
  });
});
