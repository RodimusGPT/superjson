import SuperJSON from './index.js';

import { test, expect, describe, vi } from 'vitest';

describe('cached registry lookups in composite rules', () => {
  test('customTransformerRegistry.findApplicable is called exactly once per custom-transformed value during serialization', () => {
    const instance = new SuperJSON();

    instance.registerCustom<Set<number>, number[]>(
      {
        isApplicable: (v): v is Set<number> => v instanceof Set,
        serialize: v => [...v],
        deserialize: v => new Set(v),
      },
      'SetTransformer'
    );

    const spy = vi.spyOn(
      instance.customTransformerRegistry,
      'findApplicable'
    );

    instance.serialize({ mySet: new Set([1, 2, 3]) });

    // findApplicable should be called once per custom-transformed value,
    // not multiple times (once in isApplicable, once in annotation, once in transform)
    const callsForSet = spy.mock.calls.filter(
      ([arg]) => arg instanceof Set
    );
    expect(callsForSet).toHaveLength(1);

    spy.mockRestore();
  });

  test('customTransformerRegistry.findApplicable is called once per value when multiple custom values exist', () => {
    const instance = new SuperJSON();

    class Wrapper {
      constructor(public val: string) {}
    }

    instance.registerCustom<Wrapper, string>(
      {
        isApplicable: (v): v is Wrapper => v instanceof Wrapper,
        serialize: v => v.val,
        deserialize: v => new Wrapper(v),
      },
      'WrapperTransformer'
    );

    const spy = vi.spyOn(
      instance.customTransformerRegistry,
      'findApplicable'
    );

    instance.serialize({
      a: new Wrapper('hello'),
      b: new Wrapper('world'),
    });

    const callsForWrapper = spy.mock.calls.filter(
      ([arg]) => arg instanceof Wrapper
    );
    // One call per Wrapper value, not multiple
    expect(callsForWrapper).toHaveLength(2);

    spy.mockRestore();
  });

  test('classRegistry.getIdentifier is called exactly once per class-transformed value during serialization', () => {
    const instance = new SuperJSON();

    class MyClass {
      constructor(public x: number) {}
    }

    instance.registerClass(MyClass);

    const spy = vi.spyOn(instance.classRegistry, 'getIdentifier');

    instance.serialize({ item: new MyClass(42) });

    // getIdentifier should be called once per class-transformed value,
    // not twice (once in isApplicable, once in annotation)
    const callsForMyClass = spy.mock.calls.filter(
      ([arg]) => arg === MyClass
    );
    expect(callsForMyClass).toHaveLength(1);

    spy.mockRestore();
  });

  test('classRegistry.getIdentifier is called once per value when multiple class instances exist', () => {
    const instance = new SuperJSON();

    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }

    instance.registerClass(Point);

    const spy = vi.spyOn(instance.classRegistry, 'getIdentifier');

    instance.serialize({
      p1: new Point(1, 2),
      p2: new Point(3, 4),
      p3: new Point(5, 6),
    });

    const callsForPoint = spy.mock.calls.filter(([arg]) => arg === Point);
    // One call per Point instance, not multiple
    expect(callsForPoint).toHaveLength(3);

    spy.mockRestore();
  });

  test('findApplicable is not called for non-custom values', () => {
    const instance = new SuperJSON();

    instance.registerCustom<Set<number>, number[]>(
      {
        isApplicable: (v): v is Set<number> => v instanceof Set,
        serialize: v => [...v],
        deserialize: v => new Set(v),
      },
      'SetTransformer'
    );

    const spy = vi.spyOn(
      instance.customTransformerRegistry,
      'findApplicable'
    );

    instance.serialize({ a: 'plain', b: 42, c: true });

    // findApplicable may be called to check applicability, but should not
    // find any matching transformer for plain values
    const callsWithMatch = spy.mock.calls.filter(
      ([arg]) => arg instanceof Set
    );
    expect(callsWithMatch).toHaveLength(0);

    spy.mockRestore();
  });

  test('getIdentifier is not called for non-class values', () => {
    const instance = new SuperJSON();

    class MyClass {
      constructor(public val: number) {}
    }

    instance.registerClass(MyClass);

    const spy = vi.spyOn(instance.classRegistry, 'getIdentifier');

    instance.serialize({ a: 'string', b: 123 });

    const callsForMyClass = spy.mock.calls.filter(
      ([arg]) => arg === MyClass
    );
    expect(callsForMyClass).toHaveLength(0);

    spy.mockRestore();
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
