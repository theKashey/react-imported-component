import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

class NotSoPureComponent extends PureComponent {
  static propTypes = {
    onUpdate: PropTypes.func.isRequired
  }

  componentWillUpdate() {
    this.props.onUpdate();
  }

  render() {
    return null;
  }
}

export default NotSoPureComponent;