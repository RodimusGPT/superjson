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

test('RegExp round-trip: simple pattern without slashes', () => {
  const regex = /simple/g;
  const result = SuperJSON.deserialize<RegExp>(SuperJSON.serialize(regex));
  expect(result).toBeInstanceOf(RegExp);
  expect(result.source).toBe('simple');
  expect(result.flags).toBe('g');
});

test('RegExp round-trip: escaped slash in pattern', () => {
  const regex = /a\/b/g;
  const result = SuperJSON.deserialize<RegExp>(SuperJSON.serialize(regex));
  expect(result).toBeInstanceOf(RegExp);
  expect(result.source).toBe('a\\/b');
  expect(result.flags).toBe('g');
});

test('RegExp round-trip: URL-like pattern with slashes', () => {
  const regex = /https:\/\/example\.com/i;
  const result = SuperJSON.deserialize<RegExp>(SuperJSON.serialize(regex));
  expect(result).toBeInstanceOf(RegExp);
  expect(result.source).toBe('https:\\/\\/example\\.com');
  expect(result.flags).toBe('i');
});

test('RegExp round-trip: pattern that is just slashes', () => {
  const regex = /\/\//g;
  const result = SuperJSON.deserialize<RegExp>(SuperJSON.serialize(regex));
  expect(result).toBeInstanceOf(RegExp);
  expect(result.source).toBe('\\/\\/');
  expect(result.flags).toBe('g');
});
