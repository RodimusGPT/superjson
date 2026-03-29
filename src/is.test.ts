import {
  isArray,
  isBigint,
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
  isURL,
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

test('isTypedArray identifies BigInt typed arrays as typed arrays', () => {
  expect(isTypedArray(new BigInt64Array())).toBe(true);
  expect(isTypedArray(new BigUint64Array())).toBe(true);
  expect(isTypedArray(new BigInt64Array(4))).toBe(true);
  expect(isTypedArray(new BigUint64Array(4))).toBe(true);
});

test('isTypedArray still works for standard typed arrays', () => {
  expect(isTypedArray(new Int8Array())).toBe(true);
  expect(isTypedArray(new Uint8Array())).toBe(true);
  expect(isTypedArray(new Uint8ClampedArray())).toBe(true);
  expect(isTypedArray(new Int16Array())).toBe(true);
  expect(isTypedArray(new Uint16Array())).toBe(true);
  expect(isTypedArray(new Int32Array())).toBe(true);
  expect(isTypedArray(new Uint32Array())).toBe(true);
  expect(isTypedArray(new Float32Array())).toBe(true);
  expect(isTypedArray(new Float64Array())).toBe(true);
});

test('isTypedArray rejects non-typed-array values', () => {
  expect(isTypedArray([])).toBe(false);
  expect(isTypedArray({})).toBe(false);
  expect(isTypedArray(null)).toBe(false);
  expect(isTypedArray(undefined)).toBe(false);
  expect(isTypedArray(new ArrayBuffer(8))).toBe(false);
  expect(isTypedArray(new DataView(new ArrayBuffer(8)))).toBe(false);
  expect(isTypedArray(42)).toBe(false);
  expect(isTypedArray('string')).toBe(false);
});

test('isBigint distinguishes bigint values from BigInt typed arrays', () => {
  expect(isBigint(BigInt(0))).toBe(true);
  expect(isBigint(BigInt(123))).toBe(true);
  expect(isBigint(0n)).toBe(true);

  expect(isBigint(new BigInt64Array())).toBe(false);
  expect(isBigint(new BigUint64Array())).toBe(false);
  expect(isBigint(0)).toBe(false);
  expect(isBigint(null)).toBe(false);
  expect(isBigint(undefined)).toBe(false);
});

test('BigInt typed arrays are not plain objects, arrays, or primitives', () => {
  const b64 = new BigInt64Array(2);
  const bu64 = new BigUint64Array(2);

  expect(isPlainObject(b64)).toBe(false);
  expect(isPlainObject(bu64)).toBe(false);
  expect(isArray(b64)).toBe(false);
  expect(isArray(bu64)).toBe(false);
  expect(isPrimitive(b64)).toBe(false);
  expect(isPrimitive(bu64)).toBe(false);
});
