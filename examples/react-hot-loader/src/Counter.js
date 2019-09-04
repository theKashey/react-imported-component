import React from 'react'

// const RAND = Math.round(Math.random() * 1000)

class Counter extends React.Component {
  state = { count: Math.round(Math.random() * 1000) };
  gen = 0;

  render() {
    // gen should change. count - no.
    return (
      <span>
        state({this.state.count}):rerender({this.gen++})
      </span>
    )
  }
}

export default Counter
