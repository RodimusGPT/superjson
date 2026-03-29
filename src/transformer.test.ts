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

test('round-tripped Error preserves a non-empty stack string', () => {
  const instance = new SuperJSON();
  const original = new Error('something went wrong');
  const { json, meta } = instance.serialize(original);
  const deserialized = instance.deserialize<Error>({ json, meta });

  expect(deserialized).toBeInstanceOf(Error);
  expect(deserialized.message).toBe('something went wrong');
  expect(typeof deserialized.stack).toBe('string');
  expect(deserialized.stack).toBeTruthy();
});

test('round-tripped TypeError preserves a non-empty stack string', () => {
  const instance = new SuperJSON();
  const original = new TypeError('bad type');
  const { json, meta } = instance.serialize(original);
  const deserialized = instance.deserialize<TypeError>({ json, meta });

  expect(deserialized).toBeInstanceOf(Error);
  expect(deserialized.name).toBe('TypeError');
  expect(deserialized.message).toBe('bad type');
  expect(typeof deserialized.stack).toBe('string');
  expect(deserialized.stack).toBeTruthy();
});
