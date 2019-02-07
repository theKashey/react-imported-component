// Setup express to handle Web requests

import compression from 'compression';
import express from 'express';
import middleware from './middleware';

const app = express();

// Add gzip compression to responses
app.use(compression());

// Expose the public directory as /dist and point to the browser version
app.use('/dist', express.static(__dirname + '/../client'));

// Anything unresolved is serving the application and let
// react-router do the routing!
app.get('/*', middleware);

// Check for PORT environment variable, otherwise fallback on Parcel default port
const port = process.env.PORT || 1234;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
