import SuperJSON from './index.js';

import { test, expect, describe, vi } from 'vitest';

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

describe('customRule findApplicable call count', () => {
  class Degrees {
    constructor(public value: number) {}
  }

  function createInstanceWithSpy() {
    const instance = new SuperJSON();
    instance.registerCustom<Degrees, number>(
      {
        isApplicable: (v): v is Degrees => v instanceof Degrees,
        serialize: (v) => v.value,
        deserialize: (v) => new Degrees(v),
      },
      'Degrees'
    );

    const findApplicableSpy = vi.spyOn(
      instance.customTransformerRegistry,
      'findApplicable'
    );

    return { instance, findApplicableSpy };
  }

  test.fails('findApplicable is called exactly once per custom value during serialize', () => {
    const { instance, findApplicableSpy } = createInstanceWithSpy();

    instance.serialize(new Degrees(45));

    // findApplicable should be called once for the value (to check applicability,
    // get the annotation, and transform). Currently it's called 3 times
    // because customRule calls findApplicable separately in isApplicable,
    // annotation, and transform.
    expect(findApplicableSpy).toHaveBeenCalledTimes(1);
  });

  test.fails('findApplicable is called exactly once per custom value in nested object', () => {
    const { instance, findApplicableSpy } = createInstanceWithSpy();

    instance.serialize({ angle: new Degrees(90), label: 'right angle' });

    // Only one Degrees value, so findApplicable for it should be called once
    // (other calls for non-Degrees values are fine since they return undefined)
    const callsWithDegreesArg = findApplicableSpy.mock.calls.filter(
      (args) => args[0] instanceof Degrees
    );
    expect(callsWithDegreesArg).toHaveLength(1);
  });

  test('custom transformer produces correct serialization and deserialization', () => {
    const instance = new SuperJSON();
    instance.registerCustom<Degrees, number>(
      {
        isApplicable: (v): v is Degrees => v instanceof Degrees,
        serialize: (v) => v.value,
        deserialize: (v) => new Degrees(v),
      },
      'Degrees'
    );

    const input = { angle: new Degrees(180), name: 'straight' };
    const serialized = instance.serialize(input);

    expect(serialized.json).toEqual({ angle: 180, name: 'straight' });
    expect(serialized.meta).toBeDefined();

    const deserialized = instance.deserialize<typeof input>(serialized);
    expect(deserialized.angle).toBeInstanceOf(Degrees);
    expect(deserialized.angle.value).toBe(180);
    expect(deserialized.name).toBe('straight');
  });
});
