declare module 'react-imported-component' {
    import {StatelessComponent, ComponentClass, PureComponent, ReactElement} from "react";

    type Component<P> = ComponentClass<P> | StatelessComponent<P>;
    type DefaultComponent<P> = {
        default: Component<P>
    };

    type ComponentOptions = {
        LoadingComponent?: Component<any>,
        ErrorComponent?: Component<any>,
        exportPicker?: (a: any):any,
        mark?: string
    }

    interface HOC {
        <P>(loader: () => Promise<DefaultComponent<P>>, options: ComponentOptions): Component<P>;

        (loader: () => Promise<any>, options: ComponentOptions): Component<any>;
    }

    var importedComponent: HOC;

    export default importedComponent;
    export function addPlugin(plugin: Plugin): void;
    export function printDrainHydrateMarks(): string;
    export function drainHydrateMarks(): Array<string>;
    export function rehydrateMarks(marks?: Array<string>): void;
    export function whenComponentsReady(): Promise<void>;
    export function dryRender(renderFunction: () => any): Promise<void>;

}