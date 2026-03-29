import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('BigInt64Array serialization', () => {
  test('round-trips BigInt64Array with various values', () => {
    const input = new BigInt64Array([0n, 1n, -1n, 9007199254740993n, -9007199254740993n]);
    const output = SuperJSON.deserialize<BigInt64Array>(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('round-trips empty BigInt64Array', () => {
    const input = new BigInt64Array([]);
    const output = SuperJSON.deserialize<BigInt64Array>(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output.length).toBe(0);
  });

  test('serialized form contains string representations of bigint values', () => {
    const input = new BigInt64Array([42n, -7n]);
    const serialized = SuperJSON.serialize(input);
    const jsonValues = serialized.json as string[];
    expect(jsonValues).toContain('42');
    expect(jsonValues).toContain('-7');
    // Values must be strings since JSON cannot represent bigints
    jsonValues.forEach(v => {
      expect(typeof v).toBe('string');
    });
  });
});

describe('BigUint64Array serialization', () => {
  test('round-trips BigUint64Array with various values', () => {
    const input = new BigUint64Array([0n, 1n, 18446744073709551615n]);
    const output = SuperJSON.deserialize<BigUint64Array>(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });

  test('round-trips empty BigUint64Array', () => {
    const input = new BigUint64Array([]);
    const output = SuperJSON.deserialize<BigUint64Array>(SuperJSON.serialize(input));
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output.length).toBe(0);
  });

  test('serialized form contains string representations of bigint values', () => {
    const input = new BigUint64Array([100n]);
    const serialized = SuperJSON.serialize(input);
    const jsonValues = serialized.json as string[];
    expect(jsonValues).toContain('100');
    jsonValues.forEach(v => {
      expect(typeof v).toBe('string');
    });
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
