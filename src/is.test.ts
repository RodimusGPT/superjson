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
  isURL,
  TypedArray,
  TypedArrayConstructor,
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

test('isTypedArray recognizes BigInt64Array and BigUint64Array at runtime', () => {
  const big64 = new BigInt64Array([1n, 2n, 3n]);
  const bigU64 = new BigUint64Array([1n, 2n, 3n]);

  expect(isTypedArray(big64)).toBe(true);
  expect(isTypedArray(bigU64)).toBe(true);

  // Empty BigInt typed arrays
  expect(isTypedArray(new BigInt64Array())).toBe(true);
  expect(isTypedArray(new BigUint64Array())).toBe(true);

  // Non-typed-array values should still return false
  expect(isTypedArray(null)).toBe(false);
  expect(isTypedArray(undefined)).toBe(false);
  expect(isTypedArray([])).toBe(false);
  expect(isTypedArray({})).toBe(false);
  expect(isTypedArray(new DataView(new ArrayBuffer(8)))).toBe(false);
});

test('isTypedArray recognizes all standard typed arrays', () => {
  expect(isTypedArray(new Int8Array())).toBe(true);
  expect(isTypedArray(new Uint8Array())).toBe(true);
  expect(isTypedArray(new Uint8ClampedArray())).toBe(true);
  expect(isTypedArray(new Int16Array())).toBe(true);
  expect(isTypedArray(new Uint16Array())).toBe(true);
  expect(isTypedArray(new Int32Array())).toBe(true);
  expect(isTypedArray(new Uint32Array())).toBe(true);
  expect(isTypedArray(new Float32Array())).toBe(true);
  expect(isTypedArray(new Float64Array())).toBe(true);
  expect(isTypedArray(new BigInt64Array())).toBe(true);
  expect(isTypedArray(new BigUint64Array())).toBe(true);
});

test('TypedArray type includes BigInt typed arrays', () => {
  // Type-level test: BigInt64Array and BigUint64Array should satisfy TypedArray
  const big64: TypedArray = new BigInt64Array([1n]);
  const bigU64: TypedArray = new BigUint64Array([1n]);

  // Verify they are recognized at runtime too
  expect(isTypedArray(big64)).toBe(true);
  expect(isTypedArray(bigU64)).toBe(true);
});

test('TypedArrayConstructor type includes BigInt typed array constructors', () => {
  // Type-level test: BigInt64ArrayConstructor and BigUint64ArrayConstructor
  // should be assignable to TypedArrayConstructor
  const big64Ctor: TypedArrayConstructor = BigInt64Array;
  const bigU64Ctor: TypedArrayConstructor = BigUint64Array;

  // Use the variables to avoid unused-variable errors
  expect(big64Ctor).toBe(BigInt64Array);
  expect(bigU64Ctor).toBe(BigUint64Array);
});
