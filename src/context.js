import React from 'react';
import PropTypes from 'prop-types';

const context = React.createContext
  ? React.createContext()
  : null;

let UID = 1;

export class ImportedStream extends React.Component {
  static propTypes = {
    takeUID: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.UID = UID++;
  }

  componentDidMount() {
    this.props.takeUID(this.UID);
  }

  render() {
    return (
      <context.Provider value={this.UID}>
        {this.props.children}
      </context.Provider>
    )
  }
}

const PassThrough = ({children}) => children(0);
PassThrough.propTypes = {
  children: PropTypes.func.isRequired
};

export const UIDConsumer = context ? context.Consumer : PassThrough;
