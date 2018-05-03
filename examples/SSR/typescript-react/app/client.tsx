import { rehydrateMarks } from "react-imported-component";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "./store";
import "./imported"; // eslint-disable-line

import App from "./App";

const preloadedState = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;

const store = configureStore(preloadedState);

const element = document.getElementById("app");
const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

  rehydrateMarks().then(() => {
    ReactDOM.hydrate(app, element);
  });
