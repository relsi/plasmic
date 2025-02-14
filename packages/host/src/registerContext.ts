import {
  BooleanType,
  ChoiceType,
  CustomType,
  JSONLikeType,
  NumberType,
  StringType,
  SupportControlled,
} from "./registerComponent";

const root = globalThis as any;

export type PropType<P> = SupportControlled<
  | StringType<P>
  | BooleanType<P>
  | NumberType<P>
  | JSONLikeType<P>
  | ChoiceType<P>
  | CustomType<P>
>;

type RestrictPropType<T, P> = T extends string
  ? SupportControlled<
      StringType<P> | ChoiceType<P> | JSONLikeType<P> | CustomType<P>
    >
  : T extends boolean
  ? SupportControlled<BooleanType<P> | JSONLikeType<P> | CustomType<P>>
  : T extends number
  ? SupportControlled<NumberType<P> | JSONLikeType<P> | CustomType<P>>
  : PropType<P>;

type DistributedKeyOf<T> = T extends any ? keyof T : never;

export interface ContextMeta<P> {
  /**
   * Any unique string name used to identify that context. Each context
   * should be registered with a different `meta.name`, even if they have the
   * same name in the code.
   */
  name: string;
  /**
   * The name to be displayed for the context in Studio. Optional: if not
   * specified, `meta.name` is used.
   */
  displayName?: string;
  /**
   * The javascript name to be used when generating code. Optional: if not
   * provided, `meta.name` is used.
   */
  importName?: string;
  /**
   * An object describing the context properties to be used in Studio.
   * For each `prop`, there should be an entry `meta.props[prop]` describing
   * its type.
   */
  props: { [prop in DistributedKeyOf<P>]?: RestrictPropType<P[prop], P> } & {
    [prop: string]: PropType<P>;
  };
  /**
   * The path to be used when importing the context in the generated code.
   * It can be the name of the package that contains the context, or the path
   * to the file in the project (relative to the root directory).
   */
  importPath: string;
  /**
   *  Whether the context is the default export from that path. Optional: if
   * not specified, it's considered `false`.
   */
  isDefaultExport?: boolean;
  /**
   * The prop that receives and forwards a React `ref`. Plasmic only uses `ref`
   * to interact with components, so it's not used in the generated code.
   * Optional: If not provided, the usual `ref` is used.
   */
  refProp?: string;
}

export interface ContextRegistration {
  component: React.ComponentType<any>;
  meta: ContextMeta<any>;
}

declare global {
  interface Window {
    __PlasmicContextRegistry: ContextRegistration[];
  }
}

if (root.__PlasmicContextRegistry == null) {
  root.__PlasmicContextRegistry = [];
}

export default function registerContext<T extends React.ComponentType<any>>(
  component: T,
  meta: ContextMeta<React.ComponentProps<T>>
) {
  root.__PlasmicContextRegistry.push({ component, meta });
}
