import {
  isArray,
  isBoolean,
  isDate,
  isNull,
  isNumber,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
  isPlainObject,
  isTypedArray,
  isBigIntTypedArray,
  isURL,
  BigIntTypedArrayConstructor,
} from './is.js';

import { test, expect } from 'vitest';

test('Basic true tests', () => {
  expect(isUndefined(undefined)).toBe(true);
  expect(isNull(null)).toBe(true);

  expect(isArray([])).toBe(true);
  expect(isArray([])).toBe(true);
  expect(isString('')).toBe(true);
  expect(isString('_')).toBe(true);

  expect(isBoolean(true)).toBe(true);
  expect(isBoolean(false)).toBe(true);
  expect(isRegExp(/./)).toBe(true);
  expect(isRegExp(/./gi)).toBe(true);
  expect(isNumber(0)).toBe(true);
  expect(isNumber(1)).toBe(true);
  expect(isDate(new Date())).toBe(true);
  expect(isSymbol(Symbol())).toBe(true);
  expect(isTypedArray(new Uint8Array())).toBe(true);
  expect(isURL(new URL('https://example.com'))).toBe(true);
  expect(isPlainObject({})).toBe(true);
  // eslint-disable-next-line no-new-object
  expect(isPlainObject(new Object())).toBe(true);
});

test('Basic false tests', () => {
  expect(isNumber(NaN)).toBe(false);
  expect(isDate(new Date('_'))).toBe(false);
  expect(isDate(NaN)).toBe(false);
  expect(isUndefined(NaN)).toBe(false);
  expect(isNull(NaN)).toBe(false);

  expect(isArray(NaN)).toBe(false);
  expect(isString(NaN)).toBe(false);

  expect(isBoolean(NaN)).toBe(false);
  expect(isRegExp(NaN)).toBe(false);
  expect(isSymbol(NaN)).toBe(false);

  expect(isTypedArray([])).toBe(false);

  expect(isURL('https://example.com')).toBe(false);

  expect(isPlainObject(null)).toBe(false);
  expect(isPlainObject([])).toBe(false);
  expect(isPlainObject(Object.prototype)).toBe(false);
  expect(isPlainObject(Object.create(Array.prototype))).toBe(false);
});

test('Primitive tests', () => {
  expect(isPrimitive(0)).toBe(true);
  expect(isPrimitive('')).toBe(true);
  expect(isPrimitive('str')).toBe(true);
  expect(isPrimitive(Symbol())).toBe(true);
  expect(isPrimitive(true)).toBe(true);
  expect(isPrimitive(false)).toBe(true);
  expect(isPrimitive(null)).toBe(true);
  expect(isPrimitive(undefined)).toBe(true);

  expect(isPrimitive(NaN)).toBe(false);
  expect(isPrimitive([])).toBe(false);
  expect(isPrimitive([])).toBe(false);
  expect(isPrimitive({})).toBe(false);
  // eslint-disable-next-line no-new-object
  expect(isPrimitive(new Object())).toBe(false);
  expect(isPrimitive(new Date())).toBe(false);
  expect(isPrimitive(() => {})).toBe(false);
});

test('Date exception', () => {
  expect(isDate(new Date('_'))).toBe(false);
});

test('Regression: null-prototype object', () => {
  expect(isPlainObject(Object.create(null))).toBe(true);
  expect(isPrimitive(Object.create(null))).toBe(false);
});

test('isBigIntTypedArray positive cases', () => {
  expect(isBigIntTypedArray(new BigInt64Array())).toBe(true);
  expect(isBigIntTypedArray(new BigUint64Array())).toBe(true);
  expect(isBigIntTypedArray(new BigInt64Array(4))).toBe(true);
  expect(isBigIntTypedArray(new BigUint64Array(4))).toBe(true);
});

test('isBigIntTypedArray negative cases', () => {
  expect(isBigIntTypedArray(new Int32Array())).toBe(false);
  expect(isBigIntTypedArray(new Uint8Array())).toBe(false);
  expect(isBigIntTypedArray(new Float64Array())).toBe(false);
  expect(isBigIntTypedArray([])).toBe(false);
  expect(isBigIntTypedArray(null)).toBe(false);
  expect(isBigIntTypedArray(undefined)).toBe(false);
  expect(isBigIntTypedArray({})).toBe(false);
  expect(isBigIntTypedArray(0)).toBe(false);
  expect(isBigIntTypedArray('')).toBe(false);
});

test('isTypedArray returns false for BigInt typed arrays', () => {
  expect(isTypedArray(new BigInt64Array())).toBe(false);
  expect(isTypedArray(new BigUint64Array())).toBe(false);
});

test('BigIntTypedArrayConstructor type is exported', () => {
  const ctors: BigIntTypedArrayConstructor[] = [BigInt64Array, BigUint64Array];
  expect(ctors).toHaveLength(2);
});
