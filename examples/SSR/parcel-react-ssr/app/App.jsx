import {hot} from 'react-hot-loader';
import React from 'react';
import importedComponent from 'react-imported-component';

import { Helmet } from 'react-helmet';
import { Switch, Route, Redirect } from 'react-router-dom';

import HelloWorld from './HelloWorld';
import "./base.css";

const HelloWorld2 = importedComponent(() => import('./HelloWorld2'));

export default hot(module)(function App() {
  return (
    <div>
      <Helmet defaultTitle="Hello World!">
        <meta charSet="utf-8" />
      </Helmet>
      App
      <Switch>
        <Route exact path="/" component={HelloWorld} />
        <Route exact path="/codeSplit" component={HelloWorld2} />
        <Redirect to="/" />
      </Switch>
    </div>
  );
})
