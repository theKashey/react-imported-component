import {ComponentType, ReactNode, Ref} from "react";

interface DefaultImportedComponent<P> {
  default: ComponentType<P>;
}

type DefaultComponent<P> = ComponentType<P> | DefaultImportedComponent<P>;

type LoadableComponentState = 'loading' | 'done' | 'error';

type ComponentRenderOption<P, K> = (Component: P, State: LoadableComponentState, props: K) => ReactNode;

type AdditionalHOC<T> = {
  preload(): Promise<T>;
  done: Promise<T>;
}

type ComponentOptions<P, K, RenderComponent = ComponentType<P>> = {
  LoadingComponent?: ComponentType<any>,
  ErrorComponent?: ComponentType<any>,
  exportPicker?: (a: any) => any,
  onError?: (a: any) => any,
  render?: ComponentRenderOption<RenderComponent, K>
  async?: boolean;
  forwardProps?: P;
  forwardRef?: Ref<P>;
}

type HOCType<P, K> = ComponentType<K> & AdditionalHOC<DefaultComponent<P>>;

export interface HOC {
  <P, K = P>(loader: () => Promise<DefaultComponent<P>>, options?: ComponentOptions<P, K>): HOCType<P, K>;

  <P, K = P>(loader: () => Promise<P>, options?: ComponentOptions<P, K, P> & { render: ComponentRenderOption<P, K> }): HOCType<P, K>;
}

export interface ImportedComponents {
  [index: number]: () => Promise<DefaultComponent<any>>;
}
