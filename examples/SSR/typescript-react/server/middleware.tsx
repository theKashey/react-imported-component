import React from "react";
import ReactDOM from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "../app/App";
import { configureStore } from "../app/store";

import generateHtml from "./generateHtml";

const store = configureStore();

export default (req, res) => {
  // Generate the server-rendered HTML using the appropriate router
  const context: { url?: string } = {};
  const router = (
    <Provider store={store}>
      <StaticRouter location={req.originalUrl} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );
  const markup = ReactDOM.renderToString(router);

  // If react-router is redirecting, do it on the server side
  if (context.url) {
    res.redirect(301, context.url);
  } else {
    // Format the HTML using the template and send the result
    const html = generateHtml(markup, store.getState());
    res.send(html);
  }
};
