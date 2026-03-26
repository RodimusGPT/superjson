import { Class, JSONValue, SuperJSONResult, SuperJSONValue } from './types.js';
import { ClassRegistry, RegisterOptions } from './class-registry.js';
import { Registry } from './registry.js';
import {
  CustomTransfomer,
  CustomTransformerRegistry,
} from './custom-transformer-registry.js';
import {
  applyReferentialEqualityAnnotations,
  applyValueAnnotations,
  generateReferentialEqualityAnnotations,
  walker,
} from './plainer.js';
import { copy } from 'copy-anything';

/**
 * A JSON serializer that supports rich JavaScript types like Date, RegExp, Map, Set, and more.
 * Transforms values that JSON.stringify cannot handle into a format that preserves type information,
 * then restores them on deserialization.
 *
 * @example
 * const superJson = new SuperJSON();
 * const result = superJson.serialize({ date: new Date(), map: new Map([['key', 'value']]) });
 * const original = superJson.deserialize(result);
 */
export default class SuperJSON {
  /**
   * If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  private readonly dedupe: boolean;

  /**
   * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  constructor({
    dedupe = false,
  }: {
    dedupe?: boolean;
  } = {}) {
    this.dedupe = dedupe;
  }

  /**
   * Transforms a JavaScript value into a JSON-safe representation, preserving type information
   * for types that JSON.stringify cannot handle (e.g., Date, Map, Set, BigInt).
   * @param object - The value to serialize, which may contain non-JSON-safe types.
   * @returns A result containing the JSON-safe payload and optional metadata for type reconstruction.
   */
  serialize(object: SuperJSONValue): SuperJSONResult {
    const identities = new Map<any, any[][]>();
    const output = walker(object, identities, this, this.dedupe);
    const res: SuperJSONResult = {
      json: output.transformedValue,
    };

    if (output.annotations) {
      res.meta = {
        ...res.meta,
        values: output.annotations,
      };
    }

    const equalityAnnotations = generateReferentialEqualityAnnotations(
      identities,
      this.dedupe
    );
    if (equalityAnnotations) {
      res.meta = {
        ...res.meta,
        referentialEqualities: equalityAnnotations,
      };
    }

    if (res.meta) res.meta.v = 1;

    return res;
  }

  /**
   * Reconstructs the original JavaScript value from a previously serialized SuperJSON result,
   * restoring rich types like Date, Map, Set, and referential equalities.
   * @param payload - The serialized result containing JSON data and type metadata.
   * @param options - Optional settings for deserialization.
   * @param options.inPlace - If true, mutates the input JSON directly instead of copying it first.
   * @returns The reconstructed value with all original types restored.
   */
  deserialize<T = unknown>(payload: SuperJSONResult, options?: { inPlace?: boolean }): T {
    const { json, meta } = payload;

    let result: T = options?.inPlace ? json : copy(json) as any;

    if (meta?.values) {
      result = applyValueAnnotations(result, meta.values, meta.v ?? 0, this);
    }

    if (meta?.referentialEqualities) {
      result = applyReferentialEqualityAnnotations(
        result,
        meta.referentialEqualities,
        meta.v ?? 0
      );
    }

    return result;
  }

  /**
   * Serializes a value to a JSON string with embedded type metadata, combining
   * serialize and JSON.stringify into a single step.
   * @param object - The value to convert to a SuperJSON string.
   * @returns A JSON string that can be parsed back with {@link SuperJSON.parse}.
   */
  stringify(object: SuperJSONValue): string {
    return JSON.stringify(this.serialize(object));
  }

  /**
   * Parses a SuperJSON string back into the original JavaScript value, restoring all
   * rich types that were preserved during stringification.
   * @param string - A JSON string previously produced by {@link SuperJSON.stringify}.
   * @returns The reconstructed value with all original types restored.
   */
  parse<T = unknown>(string: string): T {
    return this.deserialize(JSON.parse(string), { inPlace: true });
  }

  readonly classRegistry = new ClassRegistry();
  /**
   * Registers a custom class so that its instances can be serialized and deserialized
   * while preserving their prototype chain.
   * @param v - The class constructor to register.
   * @param options - An identifier string or options object controlling how the class is stored in the registry.
   */
  registerClass(v: Class, options?: RegisterOptions | string) {
    this.classRegistry.register(v, options);
  }

  readonly symbolRegistry = new Registry<Symbol>(s => s.description ?? '');
  /**
   * Registers a Symbol so it can be serialized and later deserialized back to the same
   * Symbol reference, since Symbols are not natively JSON-serializable.
   * @param v - The Symbol to register.
   * @param identifier - An optional string key to identify the Symbol in the registry; defaults to the Symbol's description.
   */
  registerSymbol(v: Symbol, identifier?: string) {
    this.symbolRegistry.register(v, identifier);
  }

  readonly customTransformerRegistry = new CustomTransformerRegistry();
  /**
   * Registers a custom bidirectional transformer that defines how to serialize and
   * deserialize values of a specific type not natively supported by SuperJSON.
   * @param transformer - An object with `isApplicable`, `serialize`, and `deserialize` methods.
   * @param name - A unique string identifier for this transformer, used in the serialized metadata.
   */
  registerCustom<I, O extends JSONValue>(
    transformer: Omit<CustomTransfomer<I, O>, 'name'>,
    name: string
  ) {
    this.customTransformerRegistry.register({
      name,
      ...transformer,
    });
  }

  readonly allowedErrorProps: string[] = [];
  /**
   * Adds Error property names to the allow-list so that those properties are included
   * when serializing Error objects (by default only `message`, `name`, and `stack` are kept).
   * @param props - One or more property names to preserve during Error serialization.
   */
  allowErrorProps(...props: string[]) {
    this.allowedErrorProps.push(...props);
  }

  private static defaultInstance = new SuperJSON();
  static serialize = SuperJSON.defaultInstance.serialize.bind(
    SuperJSON.defaultInstance
  );
  static deserialize = SuperJSON.defaultInstance.deserialize.bind(
    SuperJSON.defaultInstance
  );
  static stringify = SuperJSON.defaultInstance.stringify.bind(
    SuperJSON.defaultInstance
  );
  static parse = SuperJSON.defaultInstance.parse.bind(
    SuperJSON.defaultInstance
  );
  static registerClass = SuperJSON.defaultInstance.registerClass.bind(
    SuperJSON.defaultInstance
  );
  static registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(
    SuperJSON.defaultInstance
  );
  static registerCustom = SuperJSON.defaultInstance.registerCustom.bind(
    SuperJSON.defaultInstance
  );
  static allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(
    SuperJSON.defaultInstance
  );
}

export { SuperJSON, SuperJSONResult, SuperJSONValue };

export const serialize = SuperJSON.serialize;
export const deserialize = SuperJSON.deserialize;

export const stringify = SuperJSON.stringify;
export const parse = SuperJSON.parse;

export const registerClass = SuperJSON.registerClass;
export const registerCustom = SuperJSON.registerCustom;
export const registerSymbol = SuperJSON.registerSymbol;
export const allowErrorProps = SuperJSON.allowErrorProps;
