declare module 'react-imported-component' {
  import { StatelessComponent, ComponentType, ComponentClass, PureComponent, ReactNode } from "react";

  interface DefaultImportedComponent<P> {
    default: ComponentType<P>;
  }

  type DefaultComponent<P> = ComponentType<P> | DefaultImportedComponent<P>;

  interface LoadableComponentState {
    state: 'loading' | 'done' | 'error'
    AsyncComponent: any;
  }

  type ComponentOptions<P> = {
    LoadingComponent?: ComponentType<any>,
    ErrorComponent?: ComponentType<any>,
    exportPicker?: (a: any) => any,
    onError?: (a: any) => any,
    render?: (Component: ComponentType<P>, State: LoadableComponentState, props: P) => ReactNode;
    async: boolean;
  }

  interface HOC {
    <P>(loader: () => Promise<DefaultComponent<P>>, options?: ComponentOptions<P>): ComponentType<P>;
  }

  const importedComponent: HOC;

  interface ImportedComponents {
    [index: number]: () => Promise<DefaultComponent<any>>;
  }

  export const ImportedStream: StatelessComponent<{takeUID:(streamId:number)=>any}>;

  export default importedComponent;

  export function printDrainHydrateMarks(streamId?:number): string;
  export function drainHydrateMarks(streamId?:number): Array<string>;
  export function rehydrateMarks(marks?: Array<string>): Promise<void>;
  export function whenComponentsReady(): Promise<void>;
  export function dryRender(renderFunction: () => any): Promise<void>;
  export function assignImportedComponents(importedComponents: ImportedComponents): void;
}
