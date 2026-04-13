import { Registry } from './registry.js';
import { Class } from './types.js';

/**
 * Options for registering a class in the {@link ClassRegistry}.
 */
export interface RegisterOptions {
  /** Custom identifier to use instead of the class name. */
  identifier?: string;
  /** List of property names that are allowed to be serialized on instances of the class. */
  allowProps?: string[];
}

/**
 * A specialized registry for storing and looking up classes by name or custom identifier,
 * with optional control over which properties are allowed during serialization.
 *
 * @example
 * ```ts
 * const registry = new ClassRegistry();
 * registry.register(MyClass, { allowProps: ['name', 'age'] });
 * ```
 */
export class ClassRegistry extends Registry<Class> {
  constructor() {
    super(c => c.name);
  }

  private classToAllowedProps = new Map<Class, string[]>();

  /**
   * Registers a class in the registry, optionally with a custom identifier and allowed property list.
   * If the class is already registered, the call is ignored.
   *
   * @param value - The class constructor to register.
   * @param options - A custom identifier string, or a {@link RegisterOptions} object with identifier and allowed properties.
   */
  register(value: Class, options?: string | RegisterOptions): void {
    if (typeof options === 'object') {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      }

      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }

  /**
   * Retrieves the list of property names that were marked as allowed for serialization
   * when the given class was registered.
   *
   * @param value - The class constructor to look up.
   * @returns The array of allowed property names, or `undefined` if none were specified.
   */
  getAllowedProps(value: Class): string[] | undefined {
    return this.classToAllowedProps.get(value);
  }
}
