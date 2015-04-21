var _ = require('lodash');
var React = require('react/addons');

var Testing = React.createClass({
    getInitialState() {
        return { count: 0 }
    },
    onClick() {
        this.setState({count: this.state.count+1});
    },
    render: function() {
        return <div onClick={this.onClick}>
            <button>Click me</button>
            <br/>
            {this.state.count} rabbits
            {_.map(_.range(this.state.count*100), function() {
                return <img style={{position: 'absolute', top: Math.random() * 500, left: Math.random() * 1000}} src="http://fc03.deviantart.net/fs70/i/2012/095/4/6/free_bunny_icon_lineart_by_kennadee-d4v3l9e.gif" alt=""/>
            })}
        </div>
    }
});

module.exports = Testing;