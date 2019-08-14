import {StatelessComponent, Component, SuspenseProps} from "react";
import {ComponentOptions, DefaultComponent, HOC, HOCType} from "./types";

declare const importedComponent: HOC;

type LoadableResource<P> = {};

export type IComponentLoaderProps<P, K> =
  ComponentOptions<P, K> & {
  loadable: LoadableResource<P> | Promise<DefaultComponent<P>>
};

export class ComponentLoader<T, K> extends Component<IComponentLoaderProps<T, K>> {
}

export class LazyBoundary extends Component<SuspenseProps> {
}

export const ImportedStream: StatelessComponent<{ takeUID: (streamId: number) => any }>;

export default importedComponent;

export function lazy<P>(loader: () => Promise<DefaultComponent<P>>): HOCType<P, {}>;

export function dryRender(renderFunction: () => any): Promise<void>;

export function loadableResource<P>(loader: () => Promise<DefaultComponent<P>>): LoadableResource<P>;


