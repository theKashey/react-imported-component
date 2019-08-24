// Middleware for the server-rendering
import {Readable} from 'stream';
import fs from 'fs';
import MultiStream from 'multistream';
import {getProjectStyles, createLink} from 'used-styles';
import {createStyleStream} from 'used-styles/react';
import {printDrainHydrateMarks, ImportedStream} from 'react-imported-component';
import {createLoadableStream} from 'react-imported-component/server';
import React from 'react';
import ReactDOM from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';

import App from '../app/App';

const readable = () => {
  const s = new Readable();
  s._read = () => true;
  return s;
};

const readableString = string => {
  const s = new Readable();
  s.push(string);
  s.push(null);
  s._read = () => true;
  return s;
};

let projectStyles = {};
getProjectStyles(__dirname + '/../client').then(x => {
  projectStyles = x;
  console.log(x);
});

const manifect = JSON.parse(fs.readFileSync(__dirname + '/../client/parcel-manifest.json'));

export default function middleware(req, res) {
  // Generate the server-rendered HTML using the appropriate router
  const context = {};

  let streamUID = createLoadableStream();
  const htmlStream = ReactDOM.renderToNodeStream(
    <ImportedStream stream={streamUID}>
      <StaticRouter location={req.originalUrl} context={context}>
        <App/>
      </StaticRouter>
    </ImportedStream>
  );

  // If react-router is redirecting, do it on the server side
  if (context.url) {
    return res.redirect(301, context.url);
  }

  // create a style steam
  const styledStream = createStyleStream(projectStyles, (style) => (
    // just return it
    createLink(`dist/${style}`)
  ));

  // allow client to start loading js bundle
  res.write(`<!DOCTYPE html><html><head><script defer src="${manifect['client.js']}"></script></head><body><div id="app">`);

  const endStream = readableString('');

  const streams = [
    styledStream,
    endStream,
  ];

  MultiStream(streams).pipe(res);

  const importedStream  =

  // start by piping react and styled transform stream
  htmlStream.pipe(styledStream);
  styledStream.on('end', () => {
    res.write('</div>');
    // push loaded chunks information
    res.write(printDrainHydrateMarks(streamUID));
    res.write('</body></html>');
    res.end();
  });
}
