import React from "react";
import ReactDOM from "react-dom";

// this import should enable import transpilation
import "react-imported-component/macro";

import './async-imports';

import "./styles.css";
import Load from "./load";

const Async = Load(() => import("./async"));

function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Async />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
