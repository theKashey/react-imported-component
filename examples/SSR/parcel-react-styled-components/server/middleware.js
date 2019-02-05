// Middleware for the server-rendering

import { printDrainHydrateMarks } from 'react-imported-component';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import App from '../app/App';
import generateHtml from './generateHtml';

export default function middleware(req, res) {
  // Generate the server-rendered HTML using the appropriate router
  const context = {};
  const markup = ReactDOM.renderToString(
    <StaticRouter location={req.originalUrl} context={context}>
      <App />
    </StaticRouter>
  ) + printDrainHydrateMarks();

  // If react-router is redirecting, do it on the server side
  if (context.url) {
    return res.redirect(301, context.url);
  }

  // Format the HTML using the template and send the result
  const html = generateHtml(markup);
  res.send(html);
}
