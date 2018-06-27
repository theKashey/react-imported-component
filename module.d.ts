declare module 'react-imported-component' {
  import {StatelessComponent, ComponentType, ReactNode, Component} from "react";

  interface DefaultImportedComponent<P> {
    default: ComponentType<P>;
  }

  type DefaultComponent<P> = ComponentType<P> | DefaultImportedComponent<P>;

  type LoadableComponentState ='loading' | 'done' | 'error';

  type ComponentRenderOption<P, K> = (Component: P, State: LoadableComponentState, props: K) => ReactNode;

  type ComponentOptions<P, K, RenderComponent = ComponentType<P>> = {
    LoadingComponent?: ComponentType<any>,
    ErrorComponent?: ComponentType<any>,
    exportPicker?: (a: any) => any,
    onError?: (a: any) => any,
    render?: ComponentRenderOption<RenderComponent, K>
    async?: boolean;
  }

  interface HOC {
    <P, K={}>(loader: () => Promise<DefaultComponent<P>>, options?: ComponentOptions<P, K>): ComponentType<P | K>;

    <P, K={}>(loader: () => Promise<P>, options?: ComponentOptions<P, K, P> & { render: ComponentRenderOption<P, K> }): ComponentType<K>;
  }

  const importedComponent: HOC;

  interface ImportedComponents {
    [index: number]: () => Promise<DefaultComponent<any>>;
  }

  type LoadableResource<P> = {};

  export type IComponentLoaderProps<P, K> =
    ComponentOptions<P, K> & {
    loadable: LoadableResource<P> | Promise<DefaultComponent<P>>
  };

  export class ComponentLoader<T, K> extends Component<IComponentLoaderProps<T, K>> {
  }

  export const ImportedStream: StatelessComponent<{ takeUID: (streamId: number) => any }>;

  export default importedComponent;

  export function printDrainHydrateMarks(streamId?: number): string;

  export function drainHydrateMarks(streamId?: number): Array<string>;

  export function rehydrateMarks(marks?: Array<string>): Promise<void>;

  export function whenComponentsReady(): Promise<void>;

  export function dryRender(renderFunction: () => any): Promise<void>;

  export function assignImportedComponents(importedComponents: ImportedComponents): void;

  export function loadableResource<P>(loader: () => Promise<DefaultComponent<P>>): LoadableResource<P>;

  export function setConfiguration(config: {SSR?: boolean, hot?: boolean}): void;
}
