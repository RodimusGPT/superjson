import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt typed array serialization', () => {
  test('BigInt64Array round-trips correctly', () => {
    const input = new BigInt64Array([0n, 1n, -1n, 9007199254740993n]);
    const output = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('BigUint64Array round-trips correctly', () => {
    const input = new BigUint64Array([0n, 1n, 18446744073709551615n]);
    const output = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });

  test('BigInt typed arrays nested inside objects round-trip', () => {
    const input = {
      signed: new BigInt64Array([42n, -42n]),
      unsigned: new BigUint64Array([100n]),
      label: 'test',
    };
    const output = SuperJSON.deserialize<typeof input>(
      SuperJSON.serialize(input)
    );
    expect(output.signed).toBeInstanceOf(BigInt64Array);
    expect(output.signed).toEqual(input.signed);
    expect(output.unsigned).toBeInstanceOf(BigUint64Array);
    expect(output.unsigned).toEqual(input.unsigned);
    expect(output.label).toBe('test');
  });

  test('empty BigInt64Array round-trips', () => {
    const input = new BigInt64Array([]);
    const output = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('empty BigUint64Array round-trips', () => {
    const input = new BigUint64Array([]);
    const output = SuperJSON.deserialize(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
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
