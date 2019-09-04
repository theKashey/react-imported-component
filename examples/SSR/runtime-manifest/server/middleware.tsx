import React from "react";
import ReactDOM from "react-dom/server";
import {StaticRouter} from "react-router-dom";
import {Provider} from "react-redux";

import "../app/imported";
import App from "../app/App";
import {configureStore} from "../app/store";

import generateHtml from "./generateHtml";
import {ImportedStream} from "react-imported-component";
import {createLoadableStream} from "react-imported-component/server";

const store = configureStore();

export default (req, res) => {
  // Generate the server-rendered HTML using the appropriate router
  const context: { url?: string } = {};
  let streamId = createLoadableStream();
  const router = (
    <Provider store={store}>
      <StaticRouter location={req.originalUrl} context={context}>
        <ImportedStream stream={streamId}>
          <App/>
        </ImportedStream>
      </StaticRouter>
    </Provider>
  );
  const markup = ReactDOM.renderToString(router);

  // If react-router is redirecting, do it on the server side
  if (context.url) {
    res.redirect(301, context.url);
  } else {
    // Format the HTML using the template and send the result

    // stream is not defined unless we call the render
    const html = generateHtml(markup, store.getState(), () => streamId);
    res.send(html);
  }
};
