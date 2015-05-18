var _ = require('lodash');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./../InterfaceMixin');

console.log('hello?')
var SimpleDataTableColumn = React.createClass({
    mixins: [InterfaceMixin('DataTableColumn')],
    propTypes: {
        name: PropTypes.string, // field key
        title: PropTypes.string, // human-readable field name (to override schema)
        schema: PropTypes.object // schema for this column only (passed implicitly by SimpleDataTable)
    },
    render() {
        throw new Error('SimpleDataTableColumn should never be rendered!')
    }
});

module.exports = SimpleDataTableColumn;