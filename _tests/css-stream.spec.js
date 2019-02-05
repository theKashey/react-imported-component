import React from 'react';
import {expect} from 'chai';
import {renderToStaticNodeStream} from 'react-dom/server';

import {getUsedStyles, createStyleStream} from "../src/streamers/cssStream";

describe('css stream', () => {
  it('simple map', () => {
    const map = getUsedStyles(
      `<div class="a"><div class="b c d"><div class=f></div></div>`,
      {
        a: [1],
        b: [2],
        d: [3],
        e: [4],
        f: [5, 6],
      }
    );
    expect(map).to.deep.equal({
      1: true,
      2: true,
      3: true,
      5: true,
      6: true,
    })
  });

  it('React.renderToStream', async () => {
    const styles = {};
    const cssStream = createStyleStream({
      a: ['file1'],
      b: ['file1', 'file2'],
      zz: ['file3'],
      notused: ['file4']
    }, style => {
      styles[style] = (styles[style] || 0) + 1;
    });
    const output = renderToStaticNodeStream(
      <div>
        <div className="a">
          <div className="a b c">
            <div className="xx">
            </div>
          </div>
          <div className="zz">
          </div>
        </div>
      </div>
    );

    const streamString = async (readStream) => {
      const result = [];
      for await (const chunk of readStream) {
        console.log('XX', chunk);
        result.push(chunk);
      }
      return result.join('')
    };

    const [tr, base] = await Promise.all([
      streamString(output.pipe(cssStream)),
      streamString(output)
    ]);

    expect(base).to.be.equal(tr);
    expect(styles).to.deep.equal({
      file1: 1,
      file2: 1,
      file3: 1,
    })
  })
});