import SuperJSON from './index.js';

import { test, expect } from 'vitest';

test('BigInt64Array round-trip serialization', () => {
  const input = new BigInt64Array([1n, -2n, 3n]);
  const { json, meta } = SuperJSON.serialize(input);

  expect(meta).toBeDefined();
  expect(meta!.values).toBeDefined();

  const output = SuperJSON.deserialize({ json, meta });
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output).toEqual(input);
});

test('BigUint64Array round-trip serialization', () => {
  const input = new BigUint64Array([1n, 2n, 3n]);
  const { json, meta } = SuperJSON.serialize(input);

  expect(meta).toBeDefined();
  expect(meta!.values).toBeDefined();

  const output = SuperJSON.deserialize({ json, meta });
  expect(output).toBeInstanceOf(BigUint64Array);
  expect(output).toEqual(input);
});

test('Empty BigInt typed arrays round-trip', () => {
  const emptyBigInt64 = new BigInt64Array();
  const result1 = SuperJSON.deserialize(SuperJSON.serialize(emptyBigInt64));
  expect(result1).toBeInstanceOf(BigInt64Array);
  expect(result1).toEqual(emptyBigInt64);

  const emptyBigUint64 = new BigUint64Array();
  const result2 = SuperJSON.deserialize(SuperJSON.serialize(emptyBigUint64));
  expect(result2).toBeInstanceOf(BigUint64Array);
  expect(result2).toEqual(emptyBigUint64);
});

test('BigInt typed arrays use a distinguishing annotation marker', () => {
  const input = new BigInt64Array([1n]);
  const { meta } = SuperJSON.serialize(input);

  expect(meta).toBeDefined();
  expect(meta!.values).toBeDefined();

  const annotation = meta!.values;
  // The annotation should include a marker that distinguishes BigInt typed arrays
  // from regular typed arrays (e.g., 'bigint-typed-array' instead of 'typed-array')
  expect(JSON.stringify(annotation)).toContain('bigint-typed-array');
});

test('BigInt typed arrays nested in objects round-trip', () => {
  const input = {
    signed: new BigInt64Array([10n, -20n]),
    unsigned: new BigUint64Array([30n, 40n]),
  };
  const output = SuperJSON.deserialize<typeof input>(
    SuperJSON.serialize(input)
  );

  expect(output.signed).toBeInstanceOf(BigInt64Array);
  expect(output.signed).toEqual(input.signed);
  expect(output.unsigned).toBeInstanceOf(BigUint64Array);
  expect(output.unsigned).toEqual(input.unsigned);
});

test('BigInt typed array with large values round-trip', () => {
  const largePositive = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
  const largeNegative = -(BigInt(Number.MAX_SAFE_INTEGER) + 1n);
  const input = new BigInt64Array([largePositive, largeNegative, 0n]);

  const output = SuperJSON.deserialize<BigInt64Array>(
    SuperJSON.serialize(input)
  );
  expect(output).toBeInstanceOf(BigInt64Array);
  expect(output).toEqual(input);
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
