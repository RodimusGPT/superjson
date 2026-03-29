import SuperJSON from './index.js';
import { transformValue, untransformValue } from './transformer.js';

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

describe('RegExp tuple serialization', () => {
  const superJson = new SuperJSON();

  describe('round-trip via serialize/deserialize', () => {
    test('basic RegExp with flags', () => {
      const input = { pattern: /foo/gi };
      const result = SuperJSON.deserialize<typeof input>(
        SuperJSON.serialize(input)
      );
      expect(result.pattern).toBeInstanceOf(RegExp);
      expect(result.pattern).toEqual(/foo/gi);
    });

    test('RegExp with forward slashes in body', () => {
      const input = { pattern: /https:\/\/example\.com/i };
      const result = SuperJSON.deserialize<typeof input>(
        SuperJSON.serialize(input)
      );
      expect(result.pattern).toBeInstanceOf(RegExp);
      expect(result.pattern).toEqual(/https:\/\/example\.com/i);
    });

    test('RegExp with multiple consecutive slashes', () => {
      const input = { pattern: /a\/b\/c/g };
      const result = SuperJSON.deserialize<typeof input>(
        SuperJSON.serialize(input)
      );
      expect(result.pattern).toBeInstanceOf(RegExp);
      expect(result.pattern).toEqual(/a\/b\/c/g);
    });

    test('RegExp with no flags', () => {
      const input = { pattern: /test/ };
      const result = SuperJSON.deserialize<typeof input>(
        SuperJSON.serialize(input)
      );
      expect(result.pattern).toBeInstanceOf(RegExp);
      expect(result.pattern).toEqual(/test/);
    });

    test('RegExp with all flags', () => {
      const input = { pattern: new RegExp('test', 'gimsuy') };
      const result = SuperJSON.deserialize<typeof input>(
        SuperJSON.serialize(input)
      );
      expect(result.pattern).toBeInstanceOf(RegExp);
      expect(result.pattern.source).toBe('test');
      expect(result.pattern.flags).toBe('gimsuy');
    });
  });

  describe('transform produces [source, flags] tuple', () => {
    test('basic RegExp', () => {
      const transformed = transformValue(/foo/gi, superJson);
      expect(transformed).toBeDefined();
      expect(transformed!.type).toBe('regexp');
      expect(transformed!.value).toEqual(['foo', 'gi']);
    });

    test('RegExp with forward slashes in body', () => {
      const transformed = transformValue(/https:\/\/example\.com/i, superJson);
      expect(transformed).toBeDefined();
      expect(transformed!.type).toBe('regexp');
      expect(transformed!.value).toEqual(['https:\\/\\/example\\.com', 'i']);
    });

    test('RegExp with multiple consecutive slashes', () => {
      const transformed = transformValue(/a\/b\/c/g, superJson);
      expect(transformed).toBeDefined();
      expect(transformed!.type).toBe('regexp');
      expect(transformed!.value).toEqual(['a\\/b\\/c', 'g']);
    });

    test('RegExp with no flags', () => {
      const transformed = transformValue(/test/, superJson);
      expect(transformed).toBeDefined();
      expect(transformed!.type).toBe('regexp');
      expect(transformed!.value).toEqual(['test', '']);
    });

    test('RegExp with all flags', () => {
      const transformed = transformValue(
        new RegExp('test', 'gimsuy'),
        superJson
      );
      expect(transformed).toBeDefined();
      expect(transformed!.type).toBe('regexp');
      expect(transformed!.value).toEqual(['test', 'gimsuy']);
    });
  });

  describe('untransform from [source, flags] tuple', () => {
    test('basic tuple', () => {
      const result = untransformValue(['foo', 'gi'], 'regexp', superJson);
      expect(result).toBeInstanceOf(RegExp);
      expect(result).toEqual(/foo/gi);
    });

    test('tuple with forward slashes in source', () => {
      const result = untransformValue(
        ['https:\\/\\/example\\.com', 'i'],
        'regexp',
        superJson
      );
      expect(result).toBeInstanceOf(RegExp);
      expect(result).toEqual(/https:\/\/example\.com/i);
    });

    test('tuple with no flags', () => {
      const result = untransformValue(['test', ''], 'regexp', superJson);
      expect(result).toBeInstanceOf(RegExp);
      expect(result).toEqual(/test/);
    });

    test('tuple with all flags', () => {
      const result = untransformValue(
        ['test', 'gimsuy'],
        'regexp',
        superJson
      );
      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test');
      expect(result.flags).toBe('gimsuy');
    });
  });
});
