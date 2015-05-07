var _ = require('lodash');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./InterfaceMixin');

var SimpleDataTable = React.createClass({
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
    getDefaultProps() {
        return {
            sortable: true
        }
    },
    onClickColumnHeader(dataKey) {
        var isSortedOnColumn = (dataKey === this.props.sortKey);
        var isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;

        // if not already sorted by this, sort descending by this
        // if already sorted descending by this, sort ascending
        // if already sorted ascending by this, remove sort
        var sortKey = (!isSortedOnColumn || !isSortAscending) ? dataKey : undefined;
        var sortOrder = !isSortedOnColumn ? 'descending' : (!isSortAscending ? 'ascending' : undefined);
        this.props.onChangeSort(sortKey, sortOrder)
    },
    render() {
        return <table>
            <thead>
                <tr>
                    {this.props.schema.fields.map(this.renderColumnHeader)}
                </tr>
            </thead>
            <tbody>
                {this.props.data.map(this.renderRow)}
            </tbody>
        </table>
    },
    renderColumnHeader(field) {
        const onClick = this.onClickColumnHeader.bind(this, field.name);
        const isSortedOnColumn = (field.name === this.props.sortKey);
        const isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;
        const sortArrow = isSortedOnColumn ? (isSortAscending ? ' ▲' : ' ▼') : '';

        return <td onClick={onClick}>
            {field.title} {sortArrow}
        </td>
    },
    renderRow(row) {
        return <tr>
            {this.props.schema.fields.map(field => {
                return <td>
                    {row[field.name]}
                </td>
            })}
        </tr>
    }
});

module.exports = SimpleDataTable;