import * as React from "react";
import Home from "./components/Home";
import importedComponent, {ComponentLoader, loadableResource} from "react-imported-component";

const Another = importedComponent(() => import(/* webpackChunkName: namedChunk-0 */"./components/Another"), {
  LoadingComponent: () => <div>loading</div>
});
const Other1 = importedComponent(() => import(/* webpackChunkName: "namedChunk-1" */"./components/Other"));
const Other2 = importedComponent(() => import(/* webpackChunkName: "namedChunk-1" */"./components/OtherTween"));

// const AnotherWrapped = importedComponent(() => import(/* webpackChunkName: namedChunk-0 */"./components/Another"), {
//   render(Component, state, props: { prop: number }) {
//     if (state === "loading") {
//       return <span/>
//     }
//     return <div className="wrapped"><Component test={props.prop} p2={props.prop}/></div>
//   }
// });
//import Another from "./components/Another";

// @ts-ignore
// const importCss = () => im port("./App.css");

export default function App() {
  return (
    <div>
      [not-trackable]
      <ComponentLoader
        loadable={() => import("./components/Another")}
      />
      <ComponentLoader
        loadable={loadableResource(() => import("./components/Another"))}
      />
      [/not-trackable]
      [home]<Home/>[/home]
      <Another test={42} p2={42}/>

      {/*<AnotherWrapped prop={24}/>*/}

      <Other1 test={42}/>
      { 0 && <Other2/> }
      <Home/>
    </div>
  );
}
