import SuperJSON from './index.js';

import { test, expect, describe } from 'vitest';

describe('circular Error.cause', () => {
  test('self-referencing: e.cause = e does not hang or throw stack overflow', () => {
    const e = new Error('self');
    e.cause = e;

    const { json, meta } = SuperJSON.serialize(e);
    const deserialized = SuperJSON.deserialize<Error>({ json, meta });

    expect(deserialized).toBeInstanceOf(Error);
    expect(deserialized.message).toBe('self');
    // The cause should reference back to itself (circular)
    expect(deserialized.cause).toBe(deserialized);
  });

  test('mutual cycle: e1.cause = e2, e2.cause = e1 does not hang or throw stack overflow', () => {
    const e1 = new Error('first');
    const e2 = new Error('second');
    e1.cause = e2;
    e2.cause = e1;

    const { json, meta } = SuperJSON.serialize(e1);
    const deserialized = SuperJSON.deserialize<Error>({ json, meta });

    expect(deserialized).toBeInstanceOf(Error);
    expect(deserialized.message).toBe('first');

    const cause = deserialized.cause as Error;
    expect(cause).toBeInstanceOf(Error);
    expect(cause.message).toBe('second');

    // The cycle should be preserved
    expect(cause.cause).toBe(deserialized);
  });

  test('non-circular cause round-trips correctly (regression guard)', () => {
    const inner = new Error('inner');
    const outer = new Error('outer', { cause: inner });

    const { json, meta } = SuperJSON.serialize(outer);
    const deserialized = SuperJSON.deserialize<Error>({ json, meta });

    expect(deserialized).toBeInstanceOf(Error);
    expect(deserialized.message).toBe('outer');

    const cause = deserialized.cause as Error;
    expect(cause).toBeInstanceOf(Error);
    expect(cause.message).toBe('inner');
    expect(cause.cause).toBeUndefined();
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
