declare module 'react-imported-component' {
  import { StatelessComponent, ComponentClass, PureComponent, ReactElement } from "react";

  type Component<P> = ComponentClass<P> | StatelessComponent<P>;
  type DefaultComponent<P> = {
    default: Component<P>
  };

  interface LoadableComponentState {
    state: 'loading' | 'done' | 'error'
    AsyncComponent: any;
  }

  type ComponentOptions<P> = {
    LoadingComponent?: Component<any>,
    ErrorComponent?: Component<any>,
    exportPicker?: (a: any) => any,
    onError?: (a: any) => any,
    render?: (component: Component<P>, state: LoadableComponentState, props: any) => JSX.Element;
  }

  interface HOC {
    <P>(loader: () => Promise<DefaultComponent<P>>, options?: ComponentOptions<P>): Component<P>;
  }

  var importedComponent: HOC;

  interface ImportedComponents {
    [index: number]: () => Promise<DefaultComponent<any>>;
  }

  export default importedComponent;

  export function printDrainHydrateMarks(): string;
  export function drainHydrateMarks(): Array<string>;
  export function rehydrateMarks(marks?: Array<string>): Promise<void>;
  export function whenComponentsReady(): Promise<void>;
  export function dryRender(renderFunction: () => any): Promise<void>;
  export function assignImportedComponents(importedComponents: ImportedComponents): void;
}
