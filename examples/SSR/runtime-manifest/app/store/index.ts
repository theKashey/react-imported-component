import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";

export function configureStore(initialState = {}) {
  const store = createStore(rootReducer, initialState, composeWithDevTools());

  if (module.hot) {
    module.hot.accept("./reducers", () => {
      console.log("Replacing reducers...");
      store.replaceReducer(require("./reducers").default);
    });
  }

  return store;
}
