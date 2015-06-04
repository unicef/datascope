var _ = require('lodash'),
    React = require('react/addons');
var moment = require('moment');
var numeral = require('numeral');
var InterfaceMixin = require('./../InterfaceMixin');

// mostly for debugging, not fleshed out

var DataList = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeSearch', 'DatascopeSort', 'DatascopeFilter')],
    render() {
        return <div>
            {this.props.data.map(d => {
                return _.map(this.props.orderedFields, (field) => {
                    return <div>
                        <strong>{field.title}: </strong>
                        {field.renderer(d[field.key], field, {moment, numeral})}
                    </div>
                }).concat(<hr/>);
            })}
        </div>
    }
});

module.exports = DataList;

