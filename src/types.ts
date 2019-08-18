import {ComponentType, ReactNode, Ref} from "react";

export interface DefaultImportedComponent<P> {
  default: ComponentType<P>;
}

export type Mark = string[];

export type Promised<T> = () => Promise<T>;

export type DefaultComponent<P> = ComponentType<P> | DefaultImportedComponent<P>;
export type DefaultImport<T> = () => Promise<DefaultComponent<T>>

export type LoadableComponentState = {
  loading?: boolean;
  error?: any;
}


export type AdditionalHOC<T> = {
  preload(): Promise<T>;
  done: Promise<T>;
}

export interface Loadable<T> {
  done: boolean;
  error: any;
  payload: T | undefined;

  mark: Mark;

  resolution: Promise<T> | undefined;

  isLoading(): boolean;

  reset(): void;

  loadIfNeeded(): Promise<T>;

  load(): Promise<T>;

  then(callback: (x: T) => void, err: () => void): Promise<any>;
}

export type BaseComponentOptions<P> = {
  importer: DefaultImport<P>,

  LoadingComponent?: ComponentType<any>,
  ErrorComponent?: ComponentType<any>,

  onError?: (a: any) => void,

  async?: boolean;

  forwardRef?: Ref<any>;
}

export type WithoutRender<P> = {
  forwardProps?: P;
}

export type WithRender<P, K> = {
  render: (Component: P, State: LoadableComponentState, props?: K) => ReactNode;
  forwardProps?: K;
}

export type ComponentOptions<P, K> = BaseComponentOptions<P> & (WithoutRender<P> | WithRender<P, K>);

export type HOCType<P, K> = ComponentType<K> & AdditionalHOC<DefaultComponent<P>>;

export interface HOC {
  <P, K = P>(loader: DefaultImport<P>, options?: ComponentOptions<P, K>): HOCType<P, K>;
}

export interface ImportedComponents {
  [index: number]: () => Promise<DefaultComponent<any>>;
}
