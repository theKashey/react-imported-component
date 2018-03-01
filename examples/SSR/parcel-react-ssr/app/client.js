// Entry point for the browser
// Start your React application and add the required containers
// Here we have <BrowserRouter /> for react-router

import { rehydrateMarks } from 'react-imported-component';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

const element = document.getElementById('app');
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// rehydrate the bundle marks
rehydrateMarks().then(() => {
  // In production, we want to hydrate instead of render
  // because of the server-rendering
  if (process.env.NODE_ENV === 'production') {
    ReactDOM.hydrate(app, element);
  } else {
    ReactDOM.render(app, element);
  }
});

// Hot reload is that easy with Parcel
if (module.hot) {
  module.hot.accept();
}
