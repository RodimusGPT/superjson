import { JSONValue } from './types.js';
import { find } from './util.js';

/**
 * Defines the shape of a custom transformer that can serialize and deserialize
 * values of type `I` to and from a JSON-compatible representation of type `O`.
 * @template I - The input type that this transformer handles
 * @template O - The JSON-compatible output type produced by serialization
 */
export interface CustomTransfomer<I, O extends JSONValue> {
  name: string;
  isApplicable: (v: any) => v is I;
  serialize: (v: I) => O;
  deserialize: (v: O) => I;
}

/**
 * A registry that stores and retrieves custom transformers, allowing superjson
 * to be extended with user-defined serialization logic for arbitrary types.
 */
export class CustomTransformerRegistry {
  private transfomers: Record<string, CustomTransfomer<any, any>> = {};

  /**
   * Adds a custom transformer to the registry, keyed by its name.
   * If a transformer with the same name already exists, it will be overwritten.
   * @param transformer - The custom transformer to register
   */
  register<I, O extends JSONValue>(transformer: CustomTransfomer<I, O>) {
    this.transfomers[transformer.name] = transformer;
  }

  /**
   * Searches all registered transformers and returns the first one whose
   * `isApplicable` predicate returns true for the given value.
   * @param v - The value to test against registered transformers
   * @returns The matching transformer, or `undefined` if none match
   */
  findApplicable<T>(v: T) {
    return find(this.transfomers, transformer =>
      transformer.isApplicable(v)
    ) as CustomTransfomer<T, JSONValue> | undefined;
  }

  /**
   * Retrieves a previously registered transformer by its unique name.
   * @param name - The name of the transformer to look up
   * @returns The matching transformer, or `undefined` if not found
   */
  findByName(name: string) {
    return this.transfomers[name];
  }
}
