import {
  isArray,
  isEmptyObject,
  isError,
  isMap,
  isPlainObject,
  isPrimitive,
  isSet,
} from './is.js';
import { escapeKey, stringifyPath } from './pathstringifier.js';
import {
  isInstanceOfRegisteredClass,
  transformValue,
  TypeAnnotation,
  untransformValue,
} from './transformer.js';
import { includes, forEach } from './util.js';
import { parsePath } from './pathstringifier.js';
import { getDeep, setDeep } from './accessDeep.js';
import SuperJSON from './index.js';

type Tree<T> = InnerNode<T> | Leaf<T>;
type Leaf<T> = [T];
type InnerNode<T> = [T, Record<string, Tree<T>>];

export type MinimisedTree<T> = Tree<T> | Record<string, Tree<T>> | undefined;

const enableLegacyPaths = (version: number) => version < 1;

/**
 * Recursively walks a minimised annotation tree, invoking a callback for each node value along with its resolved path.
 * @param tree - The minimised tree structure to traverse
 * @param walker - Callback invoked with each node's value and its resolved path segments
 * @param version - Serialization version, used to determine legacy path parsing behavior
 * @param origin - Accumulated path segments from parent nodes
 */
function traverse<T>(
  tree: MinimisedTree<T>,
  walker: (v: T, path: string[]) => void,
  version: number,
  origin: string[] = []
): void {
  if (!tree) {
    return;
  }

  const legacyPaths = enableLegacyPaths(version);
  if (!isArray(tree)) {
    forEach(tree, (subtree, key) =>
      traverse(subtree, walker, version, [
        ...origin,
        ...parsePath(key, legacyPaths),
      ])
    );
    return;
  }

  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker, version, [
        ...origin,
        ...parsePath(key, legacyPaths),
      ]);
    });
  }

  walker(nodeValue, origin);
}

/**
 * Restores transformed values in a plain object by traversing type annotations and applying the reverse transformation for each annotated path.
 * @param plain - The plain serialized object to restore values into
 * @param annotations - Tree of type annotations indicating which values need un-transformation
 * @param version - Serialization version for path parsing compatibility
 * @param superJson - The SuperJSON instance providing registered custom transformers
 * @returns The object with all annotated values restored to their original types
 */
export function applyValueAnnotations(
  plain: any,
  annotations: MinimisedTree<TypeAnnotation>,
  version: number,
  superJson: SuperJSON
) {
  traverse(
    annotations,
    (type, path) => {
      plain = setDeep(plain, path, v => untransformValue(v, type, superJson));
    },
    version
  );

  return plain;
}

/**
 * Restores referential equality between object paths that shared the same identity before serialization,
 * ensuring that paths which pointed to the same object reference are reconnected after deserialization.
 * @param plain - The deserialized plain object to restore shared references in
 * @param annotations - Mapping of representative paths to arrays of paths that should share the same reference
 * @param version - Serialization version for path parsing compatibility
 * @returns The object with referential equalities restored
 */
export function applyReferentialEqualityAnnotations(
  plain: any,
  annotations: ReferentialEqualityAnnotations,
  version: number
) {
  const legacyPaths = enableLegacyPaths(version);
  /**
   * Sets all identical paths to reference the same object found at the given representative path.
   * @param identicalPaths - Stringified paths that should share the same object reference
   * @param path - The representative path whose value will be copied to all identical paths
   */
  function apply(identicalPaths: string[], path: string) {
    const object = getDeep(plain, parsePath(path, legacyPaths));

    identicalPaths
      .map(path => parsePath(path, legacyPaths))
      .forEach(identicalObjectPath => {
        plain = setDeep(plain, identicalObjectPath, () => object);
      });
  }

  if (isArray(annotations)) {
    const [root, other] = annotations;
    root.forEach(identicalPath => {
      plain = setDeep(
        plain,
        parsePath(identicalPath, legacyPaths),
        () => plain
      );
    });

    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }

  return plain;
}

const isDeep = (object: any, superJson: SuperJSON): boolean =>
  isPlainObject(object) ||
  isArray(object) ||
  isMap(object) ||
  isSet(object) ||
  isError(object) ||
  isInstanceOfRegisteredClass(object, superJson);

/**
 * Tracks an object's occurrence at a given path in the identity map, enabling detection of shared references
 * so that referential equality can be preserved during serialization.
 * @param object - The object whose identity is being tracked
 * @param path - The path segments at which this object was encountered
 * @param identities - Map from objects to all paths where they appear
 */
function addIdentity(object: any, path: any[], identities: Map<any, any[][]>) {
  const existingSet = identities.get(object);

  if (existingSet) {
    existingSet.push(path);
  } else {
    identities.set(object, [path]);
  }
}

interface Result {
  transformedValue: any;
  annotations?: MinimisedTree<TypeAnnotation>;
}

export type ReferentialEqualityAnnotations =
  | Record<string, string[]>
  | [string[]]
  | [string[], Record<string, string[]>];

/**
 * Builds a compact annotation structure describing which object paths share referential equality,
 * used during serialization to record shared references so they can be restored on deserialization.
 * @param identitites - Map from objects to all paths where each object appears
 * @param dedupe - When true, duplicate objects are removed (only first occurrence kept); when false, paths are sorted by length for readability
 * @returns A referential equality annotation structure, or undefined if no shared references exist
 */
export function generateReferentialEqualityAnnotations(
  identitites: Map<any, any[][]>,
  dedupe: boolean
): ReferentialEqualityAnnotations | undefined {
  const result: Record<string, string[]> = {};
  let rootEqualityPaths: string[] | undefined = undefined;

  identitites.forEach(paths => {
    if (paths.length <= 1) {
      return;
    }

    // if we're not deduping, all of these objects continue existing.
    // putting the shortest path first makes it easier to parse for humans
    // if we're deduping though, only the first entry will still exist, so we can't do this optimisation.
    if (!dedupe) {
      paths = paths
        .map(path => path.map(String))
        .sort((a, b) => a.length - b.length);
    }

    const [representativePath, ...identicalPaths] = paths;

    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(
        stringifyPath
      );
    }
  });

  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? undefined : result;
  }
}

/**
 * Recursively transforms a value and all nested values into a plain serializable form,
 * collecting type annotations and tracking object identities for referential equality preservation.
 * @param object - The value to transform
 * @param identities - Map tracking object identities across all paths for shared-reference detection
 * @param superJson - The SuperJSON instance providing registered custom transformers
 * @param dedupe - Whether to deduplicate repeated object references (replacing duplicates with null)
 * @param path - Current path segments within the root object
 * @param objectsInThisPath - Objects encountered along the current traversal path, used for circular reference detection
 * @param seenObjects - Cache of previously transformed objects to avoid redundant work
 * @returns The transformed value along with any type annotations needed for deserialization
 * @throws Error if a prototype-polluting property name (__proto__, constructor, prototype) is encountered
 */
export const walker = (
  object: any,
  identities: Map<any, any[][]>,
  superJson: SuperJSON,
  dedupe: boolean,
  path: any[] = [],
  objectsInThisPath: any[] = [],
  seenObjects = new Map<unknown, Result>()
): Result => {
  const primitive = isPrimitive(object);

  if (!primitive) {
    addIdentity(object, path, identities);

    const seen = seenObjects.get(object);
    if (seen) {
      // short-circuit result if we've seen this object before
      return dedupe
        ? {
            transformedValue: null,
          }
        : seen;
    }
  }

  if (!isDeep(object, superJson)) {
    const transformed = transformValue(object, superJson);

    const result: Result = transformed
      ? {
          transformedValue: transformed.value,
          annotations: [transformed.type],
        }
      : {
          transformedValue: object,
        };
    if (!primitive) {
      seenObjects.set(object, result);
    }
    return result;
  }

  if (includes(objectsInThisPath, object)) {
    // prevent circular references
    return {
      transformedValue: null,
    };
  }

  const transformationResult = transformValue(object, superJson);
  const transformed = transformationResult?.value ?? object;

  const transformedValue: any = isArray(transformed) ? [] : {};
  const innerAnnotations: Record<string, Tree<TypeAnnotation>> = {};

  forEach(transformed, (value, index) => {
    if (
      index === '__proto__' ||
      index === 'constructor' ||
      index === 'prototype'
    ) {
      throw new Error(
        `Detected property ${index}. This is a prototype pollution risk, please remove it from your object.`
      );
    }

    const recursiveResult = walker(
      value,
      identities,
      superJson,
      dedupe,
      [...path, index],
      [...objectsInThisPath, object],
      seenObjects
    );

    transformedValue[index] = recursiveResult.transformedValue;

    if (isArray(recursiveResult.annotations)) {
      innerAnnotations[escapeKey(index)] = recursiveResult.annotations;
    } else if (isPlainObject(recursiveResult.annotations)) {
      forEach(recursiveResult.annotations, (tree, key) => {
        innerAnnotations[escapeKey(index) + '.' + key] = tree;
      });
    }
  });

  const result: Result = isEmptyObject(innerAnnotations)
    ? {
        transformedValue,
        annotations: !!transformationResult
          ? [transformationResult.type]
          : undefined,
      }
    : {
        transformedValue,
        annotations: !!transformationResult
          ? [transformationResult.type, innerAnnotations]
          : innerAnnotations,
      };
  if (!primitive) {
    seenObjects.set(object, result);
  }

  return result;
};
