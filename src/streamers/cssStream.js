/*eslint no-console: "warn",  no-constant-condition: "warn"*/
import {Transform} from 'stream';

const findLastBrace = (data) => {
  let fromIndex = 0;
  while (true) {
    const classNamePosition = data.indexOf('class=', fromIndex);
    const endBrace = data.indexOf('>', Math.max(classNamePosition, fromIndex + 1)) + 1;
    if (endBrace === 0) {
      break;
    }
    fromIndex = Math.max(classNamePosition, endBrace);
  }
  return fromIndex;
};

export const process = (chunk, line, lookupTable, callback) => {
  console.log('...', chunk, line);
  const data = line.tail + chunk;

  const lastBrace = findLastBrace(data);
  const usedString = data.substring(0, lastBrace);

  callback(getUsedStyles(usedString, lookupTable));

  line.tail = data.substring(lastBrace);
  return usedString;
};

const createLine = () => ({
  tail: '',
});

export const getUsedStyles = (str, lookupTable) => (
  [
    ...(str.match(/class=["']([^"]+)["']/g) || []),
    ...(str.match(/class=([^"'\s>]+)/g) || []),
  ].reduce((styles, className) => {
    const classes = className.replace(/(class|'|"|=)+/g, '').split(' ');
    classes.forEach(singleClass => {
      const files = lookupTable[singleClass];
      if (files) {
        files.forEach(file => styles[file] = true);
      }
    });
    return styles;
  }, {})
);

export const createStyleStream = (lookupTable, callback) => {

  const line = createLine();
  const styles = {};

  const cb = (newStyles) => {
    Object
      .keys(newStyles)
      .forEach(style => {
        if (!styles[style]) {
          styles[style] = true;
          callback(style);
        }
      })
  };

  return new Transform({
    // transform() is called with each chunk of data
    transform(chunk, _, _callback) {
      _callback(
        undefined,
        Buffer.from(process(chunk.toString('utf-8'), line, lookupTable, cb), 'utf-8')
      );
    },

    flush(cb) {
      cb(undefined, line.tail);
    }
  });
};