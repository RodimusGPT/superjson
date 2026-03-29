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

describe('BigInt typed array round-trip serialization', () => {
  const instance = new SuperJSON();

  test('BigInt64Array round-trips correctly', () => {
    const input = new BigInt64Array([1n, -2n, 3n]);
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('BigUint64Array round-trips correctly', () => {
    const input = new BigUint64Array([1n, 2n, 3n]);
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });

  test('BigInt64Array serialized meta contains typed-array annotation', () => {
    const input = new BigInt64Array([1n, -2n, 3n]);
    const { meta } = instance.serialize(input);
    expect(meta).toBeDefined();
    expect(meta!.values).toEqual([['typed-array', 'BigInt64Array']]);
  });

  test('BigUint64Array serialized meta contains typed-array annotation', () => {
    const input = new BigUint64Array([1n, 2n, 3n]);
    const { meta } = instance.serialize(input);
    expect(meta).toBeDefined();
    expect(meta!.values).toEqual([['typed-array', 'BigUint64Array']]);
  });

  test('BigInt64Array nested inside an object round-trips correctly', () => {
    const input = {
      name: 'test',
      data: new BigInt64Array([0n, -9223372036854775808n, 9223372036854775807n]),
    };
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize<typeof input>({ json, meta });
    expect(output.name).toBe('test');
    expect(output.data).toBeInstanceOf(BigInt64Array);
    expect(output.data).toEqual(input.data);
  });

  test('BigUint64Array nested inside an object round-trips correctly', () => {
    const input = {
      name: 'test',
      values: new BigUint64Array([0n, 18446744073709551615n]),
    };
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize<typeof input>({ json, meta });
    expect(output.name).toBe('test');
    expect(output.values).toBeInstanceOf(BigUint64Array);
    expect(output.values).toEqual(input.values);
  });

  test('empty BigInt64Array round-trips correctly', () => {
    const input = new BigInt64Array([]);
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize({ json, meta });
    expect(output).toBeInstanceOf(BigInt64Array);
    expect(output).toEqual(input);
  });

  test('empty BigUint64Array round-trips correctly', () => {
    const input = new BigUint64Array([]);
    const { json, meta } = instance.serialize(input);
    const output = instance.deserialize({ json, meta });
    expect(output).toBeInstanceOf(BigUint64Array);
    expect(output).toEqual(input);
  });
});
