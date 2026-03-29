import SuperJSON from './index.js';

import { test, expect } from 'vitest';

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

test('throws a descriptive error when deserializing an unknown symbol', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: { value: 'test' },
      meta: {
        values: [['symbol', 'nonExistentSymbol']],
      },
    })
  ).toThrowError(/nonExistentSymbol/);
});

test('throws a descriptive error when deserializing an unknown typed array', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: { value: [1, 2, 3] },
      meta: {
        values: [['typed-array', 'FakeTypedArray']],
      },
    })
  ).toThrowError(/FakeTypedArray/);
});

test('throws a descriptive error when deserializing an unknown custom transformer', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: { value: 'test' },
      meta: {
        values: [['custom', 'nonExistentTransformer']],
      },
    })
  ).toThrowError(/nonExistentTransformer/);
});
