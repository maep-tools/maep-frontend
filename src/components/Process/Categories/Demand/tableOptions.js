const React = require('react');

import PropTypes from 'prop-types';

// Custom Formatter component
class PercentCompleteFormatter extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired
  };

  render() {
    const percentComplete = this.props.value + '%';
    return (
      <div className="progress" style={{marginTop: '20px'}}>
        <div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: percentComplete}}>
          {percentComplete}
        </div>
      </div>);
  }
}