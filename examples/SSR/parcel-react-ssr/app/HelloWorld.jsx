// Dead simple component for the hello world (hi mom!)

import React from 'react';
import { Link } from 'react-router-dom';
import './HelloWorld.scss';

export default function HelloWorld() {
  return <div>
    <h1 className="hello-world">Hello world</h1>
    <p style={{ textAlign: 'center', width: '400px', margin: 'auto' }}>
      This is an ordinary react component.
      <br />
      <Link to="/codeSplit">Click here</Link> to see a code-split component.
    </p>
  </div>;
}
