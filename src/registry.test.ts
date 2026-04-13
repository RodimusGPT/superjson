import { Registry } from './registry.js';
import { Class } from './types.js';

import { test, expect } from 'vitest';

test('class registry', () => {
  const registry = new Registry<Class>(c => c.name);

  /** A simple vehicle class used to test registry registration and lookup. */
  class Car {
    /** Outputs a horn sound to the console. */
    honk() {
      console.log('honk');
    }
  }
  registry.register(Car);

  expect(registry.getValue('Car')).toBe(Car);
  expect(registry.getIdentifier(Car)).toBe('Car');

  expect(() => registry.register(Car)).not.toThrow();

  registry.register(class Car {}, 'car2');

  expect(registry.getValue('car2')).not.toBeUndefined();

  registry.clear();

  expect(registry.getValue('car1')).toBeUndefined();
});
