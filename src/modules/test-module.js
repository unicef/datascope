var _ = require('lodash'),
    React = require('react/addons');
var InterfaceMixin = require('./../InterfaceMixin');

var TestElement = React.createClass({
    mixins: InterfaceMixin('Datascope', 'DatascopeSearch', 'DatascopeSort', 'DatascopeFilter'),
    componentDidMount() {
        console.log('mounted TestComponent', this.props)
    },
    render() {
        return <div>
            {this.props.data.map(d => {
                return <div>{d}</div>
            })}
        </div>

    }
});

module.exports = TestElement;