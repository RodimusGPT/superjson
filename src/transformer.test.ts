import SuperJSON from './index.js';

import { test, expect } from 'vitest';

test('BigInt64Array round-trips through SuperJSON', () => {
  const instance = new SuperJSON();
  const input = new BigInt64Array([0n, -1n, 9007199254740993n]);
  const { json, meta } = instance.serialize(input);
  const output = instance.deserialize({ json, meta });
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output).toEqual(input);
});

test('BigUint64Array round-trips through SuperJSON', () => {
  const instance = new SuperJSON();
  const input = new BigUint64Array([0n, 1n, 18446744073709551615n]);
  const { json, meta } = instance.serialize(input);
  const output = instance.deserialize({ json, meta });
  expect(output).toBeInstanceOf(BigUint64Array);
  expect(output).toEqual(input);
});

test('empty BigInt64Array round-trips through SuperJSON', () => {
  const instance = new SuperJSON();
  const input = new BigInt64Array([]);
  const { json, meta } = instance.serialize(input);
  const output = instance.deserialize({ json, meta });
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output).toEqual(input);
});

test('BigInt typed arrays nested in objects round-trip through SuperJSON', () => {
  const instance = new SuperJSON();
  const input = {
    a: new BigInt64Array([1n, 2n]),
    b: new BigUint64Array([3n, 4n]),
  };
  const { json, meta } = instance.serialize(input);
  const output = instance.deserialize<typeof input>({ json, meta });
  expect(output.a).toBeInstanceOf(BigInt64Array);
  expect(output.b).toBeInstanceOf(BigUint64Array);
  expect(output.a).toEqual(input.a);
  expect(output.b).toEqual(input.b);
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
