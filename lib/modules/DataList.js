'use strict';

var _ = require('lodash'),
    React = require('react/addons');
var moment = require('moment');
var numeral = require('numeral');
var InterfaceMixin = require('./../InterfaceMixin');

var DataList = React.createClass({
    displayName: 'DataList',

    mixins: [InterfaceMixin('Datascope', 'DatascopeSearch', 'DatascopeSort', 'DatascopeFilter')],
    componentDidMount: function componentDidMount() {
        console.log('mounted DataList', this.props, this.props.fields);
    },
    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            null,
            this.props.data.map(function (d) {
                return _.map(_this.props.orderedFields, function (field) {
                    return React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'strong',
                            null,
                            field.title,
                            ': '
                        ),
                        field.renderer(d[field.key], field, { moment: moment, numeral: numeral })
                    );
                }).concat(React.createElement('hr', null));
            })
        );
    }
});

module.exports = DataList;