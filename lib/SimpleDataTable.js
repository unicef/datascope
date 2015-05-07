'use strict';

var _ = require('lodash');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./InterfaceMixin');

var SimpleDataTable = React.createClass({
    displayName: 'SimpleDataTable',

    mixins: [InterfaceMixin('DatascopeSort')],
    propTypes: {
        // data displayed on the table, passed implicitly by Datascope
        data: React.PropTypes.array, // required
        // data schema, passed implicitly by Datascope
        schema: React.PropTypes.object, // required
        // if true, can sort table by clicking header
        sortable: React.PropTypes.bool,
        // key for the column on which the data is sorted (eg. 'age')
        sortKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        // order for the sort ('ascending' or 'descending')
        sortOrder: React.PropTypes.string,
        // callback to call when user changes sort, passed implicitly by Datascope
        onChangeSort: React.PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            sortable: true
        };
    },
    onClickColumnHeader: function onClickColumnHeader(dataKey) {
        var isSortedOnColumn = dataKey === this.props.sortKey;
        var isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;

        // if not already sorted by this, sort descending by this
        // if already sorted descending by this, sort ascending
        // if already sorted ascending by this, remove sort
        var sortKey = !isSortedOnColumn || !isSortAscending ? dataKey : undefined;
        var sortOrder = !isSortedOnColumn ? 'descending' : !isSortAscending ? 'ascending' : undefined;
        this.props.onChangeSort(sortKey, sortOrder);
    },
    render: function render() {
        return React.createElement(
            'table',
            null,
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    this.props.schema.fields.map(this.renderColumnHeader)
                )
            ),
            React.createElement(
                'tbody',
                null,
                this.props.data.map(this.renderRow)
            )
        );
    },
    renderColumnHeader: function renderColumnHeader(field) {
        var onClick = this.onClickColumnHeader.bind(this, field.name);
        var isSortedOnColumn = field.name === this.props.sortKey;
        var isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;
        var sortArrow = isSortedOnColumn ? isSortAscending ? ' ▲' : ' ▼' : '';

        return React.createElement(
            'td',
            { onClick: onClick },
            field.title,
            ' ',
            sortArrow
        );
    },
    renderRow: function renderRow(row) {
        return React.createElement(
            'tr',
            null,
            this.props.schema.fields.map(function (field) {
                return React.createElement(
                    'td',
                    null,
                    row[field.name]
                );
            })
        );
    }
});

module.exports = SimpleDataTable;