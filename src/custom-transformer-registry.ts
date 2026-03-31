import { JSONValue } from './types.js';
import { find } from './util.js';

export interface CustomTransformer<I, O extends JSONValue> {
  name: string;
  isApplicable: (v: any) => v is I;
  serialize: (v: I) => O;
  deserialize: (v: O) => I;
}

export class CustomTransformerRegistry {
  private transformers: Record<string, CustomTransformer<any, any>> = {};

  register<I, O extends JSONValue>(transformer: CustomTransformer<I, O>) {
    this.transformers[transformer.name] = transformer;
  }

  findApplicable<T>(v: T) {
    return find(this.transformers, transformer =>
      transformer.isApplicable(v)
    ) as CustomTransformer<T, JSONValue> | undefined;
  }

  findByName(name: string) {
    return this.transformers[name];
  }
}
