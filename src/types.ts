import {ComponentType, ForwardRefExoticComponent, Ref, ReactElement} from "react";

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

export interface Loadable<T> {
  done: boolean;
  error: any;
  payload: T | undefined;

  mark: Mark;

  resolution: Promise<void>;

  isLoading(): boolean;

  reset(): void;

  loadIfNeeded(): Promise<T>;

  load(): Promise<T>;

  then(callback: (x: T) => void, err: () => void): Promise<any>;
}

export type BaseComponentOptions<P> = {
  loadable: DefaultImport<P> | Loadable<P>,

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
  render: (Component: P, State: LoadableComponentState, props?: K) => ReactElement | null;
  forwardProps?: K;
}

export type ComponentOptions<P, K> = BaseComponentOptions<P> & (WithoutRender<P> | WithRender<P, K>);

export type HOCOptions = {
  noAutoImport?: boolean;
}

export type AdditionalHOC = {
  preload(): Promise<void>;
  done: Promise<void>;
}

export type HOCType<P, K> =
  ForwardRefExoticComponent<K> &
  AdditionalHOC;

export interface HOC {
  <P, K = P>(loader: DefaultImport<P>, options?: Partial<ComponentOptions<P, K>> & HOCOptions): HOCType<P, K>;
}

export interface ImportedComponents {
  [index: number]: () => Promise<DefaultComponent<any>>;
}
