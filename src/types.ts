import { ComponentType, ForwardRefExoticComponent, ReactElement, ReactNode, Ref } from 'react';

export interface DefaultImportedComponent<P> {
  default: ComponentType<P>;
}

export type AnyFunction = (x: any) => any;

export interface Default<T> {
  default: T;
}

export interface Stream {
  marks: Record<any, any>;
}

export type Mark = string[];

export type Promised<T> = () => Promise<T>;

export type DefaultComponent<P> = ComponentType<P> | DefaultImportedComponent<P>;
export type DefaultComponentImport<T> = () => Promise<DefaultComponent<T>>;

export type Defaultable<P> = P | Default<P>;
export type DefaultImport<T> = () => Promise<Defaultable<T>>;

export interface MarkMeta {
  loadable: Loadable<any>;
  mark: Mark;
  chunkName: string;
  fileName: string;
}

export type LazyImport<T> = () => Promise<DefaultImportedComponent<T>>;

export interface LoadableComponentState {
  loading?: boolean;
  error?: any;
}

export interface Loadable<T> {
  done: boolean;
  error: any;
  payload: T | undefined;

  mark: Mark;

  resolution: Promise<void>;

  isLoading(): boolean;

  reset(): void;
  replaceImportFunction(newImportFunction: Promised<T>): void;

  loadIfNeeded(): Promise<T>;

  tryResolveSync<Y = T>(then: (x: T) => Y): Promise<Y>;

  load(): Promise<T>;
  reload(): Promise<void>;

  then(callback: (x: T) => void, err: () => void): Promise<any>;
}

export interface ComponentOptions<P, K> {
  loadable: DefaultComponentImport<P> | Loadable<ComponentType<P>>;

  LoadingComponent?: ComponentType<any>;
  ErrorComponent?: ComponentType<any>;

  onError?: (a: any) => void;

  async?: boolean;

  render?: (Component: ComponentType<P>, State: LoadableComponentState, props?: K) => ReactElement | null;

  forwardRef?: Ref<any>;
  forwardProps?: K;
}

export interface HOCOptions {
  noAutoImport?: boolean;
}

export interface AdditionalHOC {
  done: Promise<void>;
  preload(): Promise<void>;
}

export type HOCType<P, K> = ForwardRefExoticComponent<K & { importedProps?: Partial<ComponentOptions<P, K>> }> &
  AdditionalHOC;

export interface ImportModuleHOCProps {
  fallback: NonNullable<ReactNode> | null;
}

export interface ImportModuleProps<T> extends ImportModuleHOCProps {
  children: (arg: T) => ReactElement | null;
}

export interface FullImportModuleProps<T> extends ImportModuleProps<T> {
  import: DefaultImport<T> | Loadable<T>;
}

export type ModuleFC<T> = (props: ImportModuleProps<T>) => ReactElement | null;

export type HOCModuleType<T> = ModuleFC<T> & AdditionalHOC;

export type HOC = <P, K = P>(loader: DefaultComponentImport<P>, options?: Partial<ComponentOptions<P, K>> & HOCOptions) => HOCType<P, K>;

export interface ImportedComponents {
  [index: number]: () => Promise<DefaultComponent<any>>;
}
