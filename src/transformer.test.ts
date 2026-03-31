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

test('RegExp deserialization throws on string missing leading slash', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: 'noleadingslash/',
      meta: {
        values: 'regexp',
      },
    })
  ).toThrowError(/noleadingslash/);
});

test('RegExp deserialization throws on string with no closing slash', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: '/unclosed',
      meta: {
        values: 'regexp',
      },
    })
  ).toThrowError(/unclosed/);
});

test('RegExp deserialization throws on empty string', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: '',
      meta: {
        values: 'regexp',
      },
    })
  ).toThrowError(/regexp/i);
});

test('RegExp deserialization throws on invalid flags', () => {
  const instance = new SuperJSON();
  expect(() =>
    instance.deserialize({
      json: '/pattern/xyz',
      meta: {
        values: 'regexp',
      },
    })
  ).toThrowError(/invalid|flag|xyz/i);
});

test('RegExp round-trips correctly with flags', () => {
  const instance = new SuperJSON();
  const regex = /foo/gi;
  const serialized = instance.serialize(regex);
  const deserialized = instance.deserialize(serialized);
  expect(deserialized).toBeInstanceOf(RegExp);
  expect((deserialized as RegExp).source).toBe('foo');
  expect((deserialized as RegExp).flags).toBe('gi');
});

test('RegExp round-trips correctly with escaped slash', () => {
  const instance = new SuperJSON();
  const regex = /escaped\/slash/;
  const serialized = instance.serialize(regex);
  const deserialized = instance.deserialize(serialized);
  expect(deserialized).toBeInstanceOf(RegExp);
  expect((deserialized as RegExp).source).toBe('escaped\\/slash');
});
