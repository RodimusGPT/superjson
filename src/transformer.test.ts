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

test('Error stack trace survives serialize/deserialize roundtrip', () => {
  const instance = new SuperJSON();
  const original = new Error('something went wrong');

  const result = instance.deserialize(instance.serialize(original));

  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe('something went wrong');
  expect((result as Error).stack).toBeDefined();
  expect(typeof (result as Error).stack).toBe('string');
  expect((result as Error).stack!.length).toBeGreaterThan(0);
  expect((result as Error).stack).toBe(original.stack);
});

test('Error with cause preserves both stack traces through roundtrip', () => {
  const instance = new SuperJSON();
  const cause = new Error('root cause');
  const original = new Error('wrapper error', { cause });

  const result = instance.deserialize(instance.serialize(original));

  expect(result).toBeInstanceOf(Error);
  const deserialized = result as Error;

  // Outer error stack preserved
  expect(deserialized.stack).toBeDefined();
  expect(typeof deserialized.stack).toBe('string');
  expect(deserialized.stack!.length).toBeGreaterThan(0);
  expect(deserialized.stack).toBe(original.stack);

  // Cause error stack preserved
  expect(deserialized.cause).toBeInstanceOf(Error);
  const deserializedCause = deserialized.cause as Error;
  expect(deserializedCause.stack).toBeDefined();
  expect(typeof deserializedCause.stack).toBe('string');
  expect(deserializedCause.stack!.length).toBeGreaterThan(0);
  expect(deserializedCause.stack).toBe(cause.stack);
});
