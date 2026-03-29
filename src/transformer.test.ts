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

describe('BigInt typed array serialization', () => {
  test('SuperJSON serializes and deserializes BigInt64Array', () => {
    const input = { a: BigInt64Array.of(1n, 2n, 3n) };
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual({ a: [['typed-array', 'BigInt64Array']] });

    const output = SuperJSON.deserialize<typeof input>({ json, meta });
    expect(output.a).toBeInstanceOf(BigInt64Array);
    expect(Array.from(output.a)).toEqual([1n, 2n, 3n]);
  });

  test('SuperJSON serializes and deserializes BigUint64Array', () => {
    const input = { a: BigUint64Array.of(1n, 2n, 3n) };
    const { json, meta } = SuperJSON.serialize(input);

    expect(meta?.values).toEqual({ a: [['typed-array', 'BigUint64Array']] });

    const output = SuperJSON.deserialize<typeof input>({ json, meta });
    expect(output.a).toBeInstanceOf(BigUint64Array);
    expect(Array.from(output.a)).toEqual([1n, 2n, 3n]);
  });

  test('SuperJSON round-trips empty BigInt typed arrays', () => {
    const input = {
      a: new BigInt64Array(),
      b: new BigUint64Array(),
    };
    const output = SuperJSON.deserialize<typeof input>(
      SuperJSON.serialize(input)
    );
    expect(output.a).toBeInstanceOf(BigInt64Array);
    expect(output.b).toBeInstanceOf(BigUint64Array);
    expect(output.a.length).toBe(0);
    expect(output.b.length).toBe(0);
  });
});
