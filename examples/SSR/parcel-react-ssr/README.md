__COMPLEX__ streamed SSR example

- `yarn start` - simple `renderToString` SSR + used style extraction
- `yarn start:stream` - complex `renderToStream` example
 - if `stream-server/middleware` is used - all styles would be in HEAD
 - if `stream-server/interleaved-middleware` is used - all styles would be _interleaved_ in result HTML